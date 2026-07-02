using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace TimeDashboard.Composers
{
    public class TimeDashboardApiComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder) =>

            // See https://docs.umbraco.com/umbraco-cms/extend-your-project/tutorials/creating-a-backoffice-api
            // for guidance on customizing this document.
            builder.AddBackOfficeOpenApiDocument(
                Constants.ApiName,
                document => document
                    .WithTitle("Time Dashboard API")
                    .WithBackOfficeAuthentication()
                    .WithJsonOptions(Umbraco.Cms.Core.Constants.JsonOptionsNames.BackOffice)
                    .ConfigureOpenApiOptions(options =>
                        options.AddDocumentTransformer((doc, _, _) =>
                        {
                            doc.Info.Version = "1.0";
                            doc.Info.Description = "Time and date endpoints for the Umbraco backoffice";
                            return Task.CompletedTask;
                        })));
    }
}
