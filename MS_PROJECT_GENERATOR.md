# MS Project File Generator - Documentation

## Overview

The MS Project File Generator allows you to convert Work Breakdown Structure (WBS) data into Microsoft Project compatible XML files. This feature enables project managers to quickly create project plans that can be imported into Microsoft Project.

## Features

✅ **Multiple Input Formats**: Supports both JSON and text-based WBS formats  
✅ **Hierarchical Structure**: Maintains parent-child task relationships  
✅ **MS Project Compatible**: Generates XML files compatible with MS Project 2003+  
✅ **Easy-to-Use Interface**: Simple web interface for quick file generation  
✅ **REST API**: Programmatic access via API endpoint  
✅ **Task Properties**: Supports duration, start dates, priorities, and more

## Accessing the Generator

### Web Interface
Navigate to: [http://localhost:3000/msproject](http://localhost:3000/msproject)

### API Endpoint
- **Endpoint**: `/api/msproject/generate`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Using the Web Interface

### Step 1: Fill Project Information
- **Project Name** (required): Name of your project
- **Start Date**: When the project begins (defaults to today)
- **Company**: Organization name (optional)
- **Project Manager**: Manager's name (optional)

### Step 2: Enter WBS Data

You can use either **Text Format** or **JSON Format**:

#### Text Format Example
```
1. Planning Phase (10 days)
  1.1. Requirements Gathering (5 days)
  1.2. System Design (5 days)
2. Development Phase (20 days)
  2.1. Frontend Development (10 days)
  2.2. Backend Development (10 days)
3. Testing Phase (5 days)
  3.1. Unit Testing (2 days)
  3.2. Integration Testing (3 days)
4. Deployment (2 days)
```

**Text Format Rules:**
- Use indentation (2 spaces per level) to show hierarchy
- Add duration in parentheses: `(X days)`
- Numbering is optional but recommended for clarity
- Each task should be on a new line

#### JSON Format Example
```json
[
  {
    "name": "Planning Phase",
    "duration": 10,
    "children": [
      { "name": "Requirements Gathering", "duration": 5 },
      { "name": "System Design", "duration": 5 }
    ]
  },
  {
    "name": "Development Phase",
    "duration": 20,
    "children": [
      { "name": "Frontend Development", "duration": 10 },
      { "name": "Backend Development", "duration": 10 }
    ]
  },
  {
    "name": "Testing Phase",
    "duration": 5,
    "children": [
      { "name": "Unit Testing", "duration": 2 },
      { "name": "Integration Testing", "duration": 3 }
    ]
  },
  {
    "name": "Deployment",
    "duration": 2
  }
]
```

**JSON Format Properties:**
- `name` (required): Task name
- `duration` (optional): Duration in days (default: 1)
- `start` (optional): Start date (defaults to project start)
- `priority` (optional): Priority 0-1000 (default: 500)
- `percentComplete` (optional): Completion percentage 0-100
- `notes` (optional): Task notes or description
- `wbs` (optional): WBS code (e.g., "1.2.3")
- `predecessors` (optional): Array of task UIDs that must complete first
- `children` (optional): Array of child tasks

### Step 3: Generate File
1. Click "Load Sample" to see an example (optional)
2. Click "Generate MS Project File"
3. The XML file will download automatically
4. Open the file in Microsoft Project

## Using the API

### Get API Information
```bash
curl http://localhost:3000/api/msproject/generate
```

### Generate MS Project File (JSON Format)
```bash
curl -X POST http://localhost:3000/api/msproject/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectData": {
      "name": "Website Development",
      "startDate": "2025-01-01",
      "company": "ACME Corp",
      "manager": "John Doe"
    },
    "tasks": [
      {
        "name": "Planning Phase",
        "duration": 10,
        "children": [
          { "name": "Requirements", "duration": 5 },
          { "name": "Design", "duration": 5 }
        ]
      }
    ]
  }' \
  -o project.xml
```

### Generate MS Project File (Text Format)
```bash
curl -X POST http://localhost:3000/api/msproject/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectData": {
      "name": "Website Development",
      "startDate": "2025-01-01"
    },
    "wbsText": "1. Planning (10 days)\n  1.1. Requirements (5 days)\n  1.2. Design (5 days)"
  }' \
  -o project.xml
```

### API Response

**Success Response:**
- Status: 200 OK
- Content-Type: application/xml
- Content-Disposition: attachment; filename="ProjectName.xml"
- Body: MS Project XML content

**Error Response:**
```json
{
  "error": "Error message",
  "validationErrors": ["Array of validation errors"]
}
```

## Opening in Microsoft Project

1. Open Microsoft Project
2. Click **File** → **Open**
3. Select the generated `.xml` file
4. Choose **"Open as a new project"** if prompted
5. Your WBS will be imported with all tasks and hierarchy

The XML format is compatible with:
- Microsoft Project 2003
- Microsoft Project 2007
- Microsoft Project 2010
- Microsoft Project 2013
- Microsoft Project 2016
- Microsoft Project 2019
- Microsoft Project for Microsoft 365

## Advanced Task Properties

When using JSON format, you can specify additional properties:

```json
{
  "name": "Backend Development",
  "duration": 10,
  "start": "2025-01-15",
  "priority": 800,
  "percentComplete": 25,
  "notes": "Use Node.js and Express framework",
  "wbs": "2.1",
  "predecessors": [3, 4],
  "children": [
    {
      "name": "Database Design",
      "duration": 3,
      "priority": 900,
      "percentComplete": 100,
      "notes": "PostgreSQL schema design"
    },
    {
      "name": "API Development",
      "duration": 7,
      "priority": 800,
      "predecessors": [5]
    }
  ]
}
```

## Validation Rules

The API validates your WBS data and returns errors if:
- Project name is missing
- No tasks are provided
- Task names are missing or invalid
- Duration values are negative
- JSON format is malformed

## Tips for Best Results

1. **Start Simple**: Begin with a basic structure and add complexity
2. **Use Meaningful Names**: Clear task names help with project management
3. **Set Realistic Durations**: Based on actual work estimates
4. **Logical Hierarchy**: Group related tasks under parent tasks
5. **Test Small First**: Validate with a small WBS before creating large ones
6. **Save Your WBS**: Keep the JSON/text for future modifications

## Troubleshooting

### File Won't Open in MS Project
- Ensure you're using MS Project 2003 or later
- Check that the file downloaded completely
- Try "Import" instead of "Open" in MS Project

### Tasks Not Showing Hierarchy
- Verify indentation in text format (2 spaces per level)
- Check `children` array structure in JSON format
- Ensure parent tasks are listed before children

### Durations Not Correct
- Duration is specified in **days**, not hours
- Use whole numbers for durations
- Format: `(X days)` in text or `"duration": X` in JSON

### API Returns Validation Errors
- Check that all required fields are present
- Verify JSON is properly formatted
- Ensure task names are strings
- Check that durations are positive numbers

## Examples

### Simple Project
```json
{
  "projectData": { "name": "Website Redesign", "startDate": "2025-01-01" },
  "tasks": [
    { "name": "Design", "duration": 5 },
    { "name": "Development", "duration": 10 },
    { "name": "Testing", "duration": 3 }
  ]
}
```

### Complex Project with Dependencies
```json
{
  "projectData": {
    "name": "Software Release v2.0",
    "startDate": "2025-01-01",
    "manager": "Jane Smith"
  },
  "tasks": [
    {
      "name": "Planning",
      "duration": 5,
      "wbs": "1",
      "children": [
        { "name": "Kickoff Meeting", "duration": 1, "wbs": "1.1" },
        { "name": "Requirements", "duration": 4, "wbs": "1.2" }
      ]
    },
    {
      "name": "Development",
      "duration": 15,
      "wbs": "2",
      "children": [
        { "name": "Module A", "duration": 8, "wbs": "2.1" },
        { "name": "Module B", "duration": 7, "wbs": "2.2" }
      ]
    }
  ]
}
```

## Technical Details

### XML Schema
The generator produces XML compliant with the Microsoft Project XML Schema. The schema includes:
- Project metadata (name, start date, manager, etc.)
- Task definitions with unique IDs
- Hierarchical outline structure
- Duration in ISO 8601 format (PT[hours]H[minutes]M[seconds]S)
- Task properties (priority, percent complete, etc.)

### File Size Limits
- Recommended: Up to 500 tasks per file
- Maximum: Limited by browser memory and MS Project capabilities
- For very large projects, consider splitting into sub-projects

## Support

For questions or issues:
1. Check this documentation
2. Test with the provided sample data
3. Verify your WBS data format
4. Contact system administrator if problems persist

## License

This feature is part of the NADRA-APP system and follows the same MIT license as the main application.

---

**Last Updated**: December 2025  
**Version**: 1.0.0
