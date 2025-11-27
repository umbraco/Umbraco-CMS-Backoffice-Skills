using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BlankExtension.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "BlankExtension")]
    public class BlankExtensionApiController : BlankExtensionApiControllerBase
    {

        [HttpGet("ping")]
        [ProducesResponseType<string>(StatusCodes.Status200OK)]
        public string Ping() => "Pong";
    }
}
