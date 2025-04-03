using System.Text.Json;
using System.Text.Json.Serialization;
using LLama;
using LLama.Common;
using LLama.Sampling;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(builder => builder.AddDefaultPolicy(
    policy =>
        policy
            .WithOrigins("https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    )
);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();

var agents = new Dictionary<string, InteriorAgent>();
var options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    WriteIndented = true,
    Converters =
    {
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase),
    },
};
app.MapPost(/*lang=Route*/"/api/ask", async (HttpContext context, [FromBody] QuestionViewModel question) =>
{
    var ip = context.Connection.RemoteIpAddress?.ToString() ?? context.Request.Headers["X-Forwarded-For"].ToString();
    if (!agents.TryGetValue(ip, out var agent))
    {
        agent = new InteriorAgent();
        agents.Add(ip, agent);
    }
    return Results.Ok(JsonSerializer.Deserialize<Furniture>(await agent.Ask(question.Question), options));
    //return Results.Ok(await agent.Ask(question.Question));
})
.WithName("GetAnswer");

app.Run();

record QuestionViewModel
{
    public required string Question { get; init; }
}

record Point2D
{
    public float X { get; init; }
    public float Y { get; init; }
}

record Furniture
{
    public string Name { get; init; } = string.Empty;
    public Point2D Origin { get; init; } = new Point2D();
    public float Angle { get; init; }
    public float Width { get; init; }
    public float Depth { get; init; }
    public string Texture { get; init; } = string.Empty;
}

class InteriorAgent
{
    private const string modelPath = @"./models/model.gguf";

    private readonly List<(string, string)> history = [];

    public async Task<string> Ask(string question)
    {
        var parameters = new ModelParams(modelPath)
        {
            ContextSize = 1024, // The longest length of chat as memory.
            GpuLayerCount = 5 // How many layers to offload to GPU. Please adjust it according to your GPU memory.
        };
        using var model = LLamaWeights.LoadFromFile(parameters);
        using var context = model.CreateContext(parameters);
        var executor = new InteractiveExecutor(context);

        var chatHistory = new ChatHistory();
        chatHistory.AddMessage(AuthorRole.System, "Transcript of a dialog, where the User interacts with an Agent that is an expert in interior design that creates JSON representations of furniture. The agent is helpful, kind, honest, and never fails to answer the User's requests immediately and with precision.");
        chatHistory.AddMessage(AuthorRole.System, "The JSON schema is as follows: { \"name\": string, \"origin\": { \"x\": number, \"y\": number }, \"angle\": number, \"width\": number, \"depth\": number, \"texture\": string } where name is the name of the piece of furniture, origin is the x and y coordinates where the furniture is in the room, angle is the rotation of the furniture, width and depth are the dimensions of the furniture, and texture is the texture or material of the furniture.");
        chatHistory.AddMessage(AuthorRole.System, "The agent should never say that it cannot create a piece of furniture. It should always create a piece of furniture according to the User's request.");
        chatHistory.AddMessage(AuthorRole.System, "The metrics of the room are in centimeters. The agent should always use meters as the unit of measurement for the furniture. The agent should never use any other unit of measurement.");
        chatHistory.AddMessage(AuthorRole.System, "The agent should only output exactly one furniture in the JSON format. It should never output more than one piece of furniture at a time. It should never output any other text, except for the JSON representation of the furniture.");
        chatHistory.AddMessage(AuthorRole.User, "What would a table look like in the middle of the room.");
        chatHistory.AddMessage(AuthorRole.Assistant, /* lang=json,strict */@"{ ""name"": ""table"", ""origin"": { ""x"": 22, ""y"": 24 }, ""angle"": 90, ""width"": 90, ""depth"": 240, ""texture"": ""wood"" }");
        foreach (var (q, a) in history)
        {
            chatHistory.AddMessage(AuthorRole.User, q);
            chatHistory.AddMessage(AuthorRole.Assistant, a);
        }

        var session = new ChatSession(executor, chatHistory);

        var inferenceParams = new InferenceParams()
        {
            MaxTokens = 256, // No more than 256 tokens should appear in answer. Remove it if antiprompt is enough for control.
            AntiPrompts = ["User:", "System:"], // Stop generation once antiprompts appear.
            SamplingPipeline = new DefaultSamplingPipeline(),
        };
        List<string> parts = [];
        await foreach (var line in session.ChatAsync(new ChatHistory.Message(AuthorRole.User, question), inferenceParams))
        {
            Console.WriteLine(line);
            parts.Add(line);
        }
        var answer = string.Join(string.Empty, parts)
            .Replace("Assistant:", string.Empty)
            .Replace("User:", string.Empty)
            .Replace("System:", string.Empty)
            .Trim();
        history.Add((question, answer));
        return answer;
    }
}