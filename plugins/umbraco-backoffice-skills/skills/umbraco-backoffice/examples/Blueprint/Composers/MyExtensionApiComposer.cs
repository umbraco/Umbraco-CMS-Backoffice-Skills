using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace MyExtension.Composers
{
    public class MyExtensionApiComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder) =>

            // Adds a dedicated backoffice OpenAPI document for this package, browsable via Swagger UI and
            // usable to auto-generate a TypeScript client.
            // See https://docs.umbraco.com/umbraco-cms/extend-your-project/tutorials/creating-a-backoffice-api
            builder.AddBackOfficeOpenApiDocument(
                Constants.ApiName,
                document => document
                    .WithTitle("My Extension Backoffice API")
                    .WithBackOfficeAuthentication()
                    .WithJsonOptions(Umbraco.Cms.Core.Constants.JsonOptionsNames.BackOffice)
                    .ConfigureOpenApiOptions(options =>
                        options.AddDocumentTransformer((doc, _, _) =>
                        {
                            doc.Info.Version = "1.0";
                            return Task.CompletedTask;
                        })));
    }
}
