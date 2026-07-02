using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using NotesWiki.Services;

namespace NotesWiki.Composers;

/// <summary>
/// Composer that configures the Notes Wiki API services and OpenAPI documentation.
/// </summary>
public class NotesApiComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        // Register our services
        builder.Services.AddSingleton<INotesService, NotesService>();

        // Add a dedicated backoffice OpenAPI document for the Notes Wiki API.
        // This is available at /umbraco/swagger/noteswiki/swagger.json
        // See https://docs.umbraco.com/umbraco-cms/extend-your-project/tutorials/creating-a-backoffice-api
        builder.AddBackOfficeOpenApiDocument(
            Constants.ApiName,
            document => document
                .WithTitle("Notes Wiki Backoffice API")
                .WithBackOfficeAuthentication()
                .WithJsonOptions(Umbraco.Cms.Core.Constants.JsonOptionsNames.BackOffice)
                .ConfigureOpenApiOptions(options =>
                    options.AddDocumentTransformer((doc, _, _) =>
                    {
                        doc.Info.Version = "1.0";
                        doc.Info.Description = "API for the Notes Wiki Umbraco extension";
                        return Task.CompletedTask;
                    })));
    }
}
