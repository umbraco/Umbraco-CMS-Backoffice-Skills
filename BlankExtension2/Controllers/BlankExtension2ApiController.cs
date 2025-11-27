using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BlankExtension2.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "BlankExtension2")]
    public class BlankExtension2ApiController : BlankExtension2ApiControllerBase
    {

        [HttpGet("ping")]
        [ProducesResponseType<string>(StatusCodes.Status200OK)]
        public string Ping() => "Pong";
    }
}
