---
name: umbraco-add-extension-reference
description: Add a new Umbraco extension project reference to the main Umbraco instance
version: 1.0.0
location: managed
allowed-tools: Read, Edit, Glob, Grep
---

# Add Extension Reference to Umbraco Instance

## What is it?
After creating a new Umbraco backoffice extension project, it must be added as a project reference in the main Umbraco instance's `.csproj` file. Without this reference, the extension will not be loaded when running the Umbraco site.

## When to Use
Use this skill after:
- Creating a new extension with `dotnet new umbraco-extension`
- Moving or copying an extension project to your solution
- Setting up a new extension from the `umbraco-backoffice` blueprints

## Workflow

### Step 1: Find the Main Umbraco Project

The main Umbraco instance `.csproj` file must be discovered dynamically. Search for it using these criteria:

```bash
# Find all .csproj files
Glob: **/*.csproj

# Then search for the one containing Umbraco.Cms package reference
Grep: Umbraco\.Cms" Version  (in *.csproj files)
```

The main Umbraco project will have:
- A `<PackageReference Include="Umbraco.Cms" ...>` entry
- SDK of `Microsoft.NET.Sdk.Web`
- Usually located at the solution root or in a dedicated folder

### Step 2: Read the Project File

Once found, read the `.csproj` file to understand its structure and find where `<ProjectReference>` entries are located.

### Step 3: Calculate Relative Path

Calculate the relative path from the main project's directory to the new extension's `.csproj` file:
- Use forward slashes `/` (cross-platform compatible)
- Path is relative to the main `.csproj` file's directory

Example paths:
| Extension Location | Example Relative Path |
|-------------------|----------------------|
| Sibling folder | `../MyExtension/MyExtension.csproj` |
| Subfolder | `./extensions/MyExtension/MyExtension.csproj` |
| Skills folder | `../.claude/skills/.../MyExtension.csproj` |

### Step 4: Add the ProjectReference

Add a `<ProjectReference>` entry in an `<ItemGroup>`:

```xml
<ItemGroup>
  <!-- Existing references -->
  <ProjectReference Include="../ExistingExtension/ExistingExtension.csproj" />
  <!-- Add new extension here -->
  <ProjectReference Include="../NewExtension/NewExtension.csproj" />
</ItemGroup>
```

If there's already an `<ItemGroup>` with `<ProjectReference>` entries, add to that one. Otherwise, create a new `<ItemGroup>`.

## Example

### Before
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Umbraco.Cms" Version="16.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="../BlankExtension/BlankExtension.csproj" />
  </ItemGroup>
</Project>
```

### After Adding "MyNewExtension"
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Umbraco.Cms" Version="16.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="../BlankExtension/BlankExtension.csproj" />
    <ProjectReference Include="../MyNewExtension/MyNewExtension.csproj" />
  </ItemGroup>
</Project>
```

## Implementation Checklist

1. [ ] **Discover** the main Umbraco project using Glob + Grep for `Umbraco.Cms`
2. [ ] **Read** the main project file to understand structure
3. [ ] **Calculate** relative path from main project to new extension
4. [ ] **Verify** the extension `.csproj` file exists at the calculated path
5. [ ] **Edit** the main project file to add `<ProjectReference>`
6. [ ] **Ask user** to verify with `dotnet build`

## Verification

After adding the reference, the user should verify by:
1. Building the solution: `dotnet build`
2. Running the Umbraco instance: `dotnet run`
3. Checking the backoffice loads the extension

## Troubleshooting

**Build error: Project not found**
- Check the relative path is correct
- Verify the extension `.csproj` file exists
- Ensure forward slashes are used in the path

**Extension not loading**
- Verify the extension has been built: `cd ExtensionName/Client && npm run build`
- Check the `umbraco-package.json` exists in the extension's `wwwroot` folder
- Look for errors in the browser console

**Multiple Umbraco projects found**
- If there are multiple `.csproj` files with `Umbraco.Cms`, ask the user which one is the main instance
- The main instance is typically the one with `Microsoft.NET.Sdk.Web` SDK and a `Program.cs` or `Startup.cs`
