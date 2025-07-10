# airtable-mcp-server

[![smithery badge](https://smithery.ai/badge/airtable-mcp-server)](https://smithery.ai/server/airtable-mcp-server)

A Model Context Protocol server that provides read and write access to Airtable databases. This server enables LLMs to inspect database schemas, then read and write records.

https://github.com/user-attachments/assets/c8285e76-d0ed-4018-94c7-20535db6c944

## Usage

1.  **Start the server**:
    ```bash
    npm start
    ```
    The server will start on port 8080.

2.  **Configure your client**:
    To use this server with a client like the Claude Desktop app, add the following configuration to the "mcpServers" section of your client's configuration file. The API key should be provided in the `Authorization` header as a Bearer token.

    ```json
    {
      "mcpServers": {
        "airtable": {
          "url": "http://localhost:8080/sse",
          "headers": {
            "Authorization": "Bearer pat123.abc123"
          }
        }
      }
    }
    ```
    Replace `pat123.abc123` with your [Airtable personal access token](https://airtable.com/create/tokens). Your token should have at least `schema.bases:read` and `data.records:read`, and optionally the corresponding write permissions.

## Components

### Tools

- **list_records**
  - Lists records from a specified Airtable table
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table to query
    - `maxRecords` (number, optional): Maximum number of records to return. Defaults to 100.
    - `filterByFormula` (string, optional): Airtable formula to filter records

- **search_records**
  - Search for records containing specific text
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table to query
    - `searchTerm` (string, required): Text to search for in records
    - `fieldIds` (array, optional): Specific field IDs to search in. If not provided, searches all text-based fields.
    - `maxRecords` (number, optional): Maximum number of records to return. Defaults to 100.

- **list_bases**
  - Lists all accessible Airtable bases
  - No input parameters required
  - Returns base ID, name, and permission level

- **describe_base**
  - Gets a complete schema for a specific base, including all its tables
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `detailLevel` (string, optional): The amount of detail to get about the tables (`tableIdentifiersOnly`, `identifiersOnly`, or `full`)
  - Returns the base information along with a list of all its tables and their schemas to the specified detail level.

- **describe_all_bases**
  - Gets a complete schema for all accessible bases and their tables
  - Input parameters:
    - `detailLevel` (string, optional): The amount of detail to get about the tables (`tableIdentifiersOnly`, `identifiersOnly`, or `full`)
  - Returns a list of all bases, each with a list of all its tables and their schemas to the specified detail level.

- **list_tables**
  - Lists all tables in a specific base
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `detailLevel` (string, optional): The amount of detail to get about the tables (`tableIdentifiersOnly`, `identifiersOnly`, or `full`)
  - Returns table ID, name, description, fields, and views (to the given `detailLevel`)

- **describe_table**
  - Gets detailed information about a specific table
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table to describe
    - `detailLevel` (string, optional): The amount of detail to get about the table (`tableIdentifiersOnly`, `identifiersOnly`, or `full`)
  - Returns the same format as list_tables but for a single table
  - Useful for getting details about a specific table without fetching information about all tables in the base

- **get_record**
  - Gets a specific record by ID
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table
    - `recordId` (string, required): The ID of the record to retrieve

- **create_record**
  - Creates a new record in a table
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table
    - `fields` (object, required): The fields and values for the new record

- **update_records**
  - Updates one or more records in a table
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table
    - `records` (array, required): Array of objects containing record ID and fields to update

- **delete_records**
  - Deletes one or more records from a table
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table
    - `recordIds` (array, required): Array of record IDs to delete

- **create_table**
  - Creates a new table in a base
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `name` (string, required): Name of the new table
    - `description` (string, optional): Description of the table
    - `fields` (array, required): Array of field definitions (name, type, description, options)

- **update_table**
  - Updates a table's name or description
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table
    - `name` (string, optional): New name for the table
    - `description` (string, optional): New description for the table

- **create_field**
  - Creates a new field in a table
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table
    - `name` (string, required): Name of the new field
    - `type` (string, required): Type of the field
    - `description` (string, optional): Description of the field
    - `options` (object, optional): Field-specific options

- **update_field**
  - Updates a field's name or description
  - Input parameters:
    - `baseId` (string, required): The ID of the Airtable base
    - `tableId` (string, required): The ID of the table
    - `fieldId` (string, required): The ID of the field
    - `name` (string, optional): New name for the field
    - `description` (string, optional): New description for the field

### Resources

The server provides schema information for Airtable bases and tables:

- **Table Schemas** (`airtable://<baseId>/<tableId>/schema`)
  - JSON schema information for each table
  - Includes:
    - Base id and table id
    - Table name and description
    - Primary field ID
    - Field definitions (ID, name, type, description, options)
    - View definitions (ID, name, type)
  - Automatically discovered from Airtable's metadata API

## Hosting with Docker

To host this server using Docker, follow these steps:

1.  **Build the Docker image**:
    ```bash
    docker build -t airtable-mcp-server .
    ```

2.  **Run the Docker container**:
    ```bash
    docker run -p 8080:8080 airtable-mcp-server
    ```
    This will start the server and map port 8080 from the container to port 8080 on your host machine. You can then access the server at `http://localhost:8080`.

    For production use, you should run this behind a reverse proxy that provides HTTPS.

## Contributing

Pull requests are welcomed on GitHub! To get started:

1. Install Git and Node.js
2. Clone the repository
3. Install dependencies with `npm install`
4. Run `npm run test` to run tests
5. Build with `npm run build`
  - You can use `npm run build:watch` to automatically build after editing [`src/index.ts`](./src/index.ts). This means you can hit save, reload Claude Desktop (with Ctrl/Cmd+R), and the changes apply.

## Releases

Versions follow the [semantic versioning spec](https://semver.org/).

To release:

1. Use `npm version <major | minor | patch>` to bump the version
2. Run `git push --follow-tags` to push with tags
3. Wait for GitHub Actions to publish to the NPM registry.
