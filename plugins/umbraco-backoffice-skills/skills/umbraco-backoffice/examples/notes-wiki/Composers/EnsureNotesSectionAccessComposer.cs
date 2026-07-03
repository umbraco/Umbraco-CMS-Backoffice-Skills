using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Services.OperationStatus;

namespace NotesWiki.Composers;

/// <summary>
/// A custom backoffice <c>section</c> is only shown to users whose user group is allowed to
/// access it. A fresh Umbraco install does not grant custom sections to any group, so without
/// this the "Notes" section would be invisible even to administrators until someone adds it
/// manually under Users &gt; User Groups &gt; Administrators &gt; Sections.
///
/// This composer wires a startup handler that grants the Notes section to the Administrators
/// group once, so the example works out-of-the-box on any (including unattended) install.
///
/// Skills used: umbraco-sections, umbraco-controllers (composers/notifications)
/// </summary>
public class EnsureNotesSectionAccessComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
        => builder.AddNotificationAsyncHandler<UmbracoApplicationStartedNotification, EnsureNotesSectionAccessHandler>();
}

/// <summary>
/// Grants the Notes section to the Administrators user group on application start (idempotent).
/// </summary>
public class EnsureNotesSectionAccessHandler : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    // Must match NOTES_SECTION_ALIAS in Client/src/section/constants.ts.
    private const string NotesSectionAlias = "Notes.Section";

    private readonly IUserGroupService _userGroupService;
    private readonly ILogger<EnsureNotesSectionAccessHandler> _logger;

    public EnsureNotesSectionAccessHandler(
        IUserGroupService userGroupService,
        ILogger<EnsureNotesSectionAccessHandler> logger)
    {
        _userGroupService = userGroupService;
        _logger = logger;
    }

    public async Task HandleAsync(UmbracoApplicationStartedNotification notification, CancellationToken cancellationToken)
    {
        IUserGroup? adminGroup = await _userGroupService.GetAsync(Umbraco.Cms.Core.Constants.Security.AdminGroupAlias);
        if (adminGroup is null || adminGroup.AllowedSections.Contains(NotesSectionAlias))
        {
            return;
        }

        adminGroup.AddAllowedSection(NotesSectionAlias);
        Attempt<IUserGroup, UserGroupOperationStatus> result =
            await _userGroupService.UpdateAsync(adminGroup, Umbraco.Cms.Core.Constants.Security.SuperUserKey);

        if (result.Success)
        {
            _logger.LogInformation("Granted the '{Section}' section to the '{Group}' user group.", NotesSectionAlias, Umbraco.Cms.Core.Constants.Security.AdminGroupAlias);
        }
        else
        {
            _logger.LogWarning("Could not grant the '{Section}' section to the '{Group}' user group: {Status}.", NotesSectionAlias, Umbraco.Cms.Core.Constants.Security.AdminGroupAlias, result.Status);
        }
    }
}
