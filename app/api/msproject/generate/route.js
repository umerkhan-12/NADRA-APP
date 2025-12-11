import { NextResponse } from 'next/server';
import { generateMSProjectXML, parseWBSData, validateWBSData } from '@/lib/msProjectGenerator';

/**
 * POST /api/msproject/generate
 * Generate MS Project XML file from WBS data
 * 
 * Request body:
 * {
 *   "projectData": {
 *     "name": "Project Name",
 *     "startDate": "2025-01-01",
 *     "company": "Company Name",
 *     "manager": "Manager Name"
 *   },
 *   "tasks": [
 *     {
 *       "name": "Task 1",
 *       "duration": 5,
 *       "children": [...]
 *     }
 *   ]
 * }
 * 
 * Or with text-based WBS:
 * {
 *   "projectData": {...},
 *   "wbsText": "1. Phase 1 (5 days)\\n  1.1. Task A (2 days)"
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { projectData, tasks, wbsText } = body;

    // Validate project data
    if (!projectData || !projectData.name) {
      return NextResponse.json(
        { error: 'Project data with name is required' },
        { status: 400 }
      );
    }

    // Parse WBS data
    let parsedTasks = [];
    if (wbsText) {
      parsedTasks = parseWBSData(wbsText);
    } else if (tasks) {
      parsedTasks = parseWBSData(tasks);
    } else {
      return NextResponse.json(
        { error: 'Either tasks or wbsText must be provided' },
        { status: 400 }
      );
    }

    // Validate WBS data
    const validation = validateWBSData(parsedTasks);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid WBS data',
          validationErrors: validation.errors
        },
        { status: 400 }
      );
    }

    // Generate MS Project XML
    const xml = generateMSProjectXML(projectData, parsedTasks);

    // Return XML file
    const filename = `${projectData.name.replace(/[^a-z0-9]/gi, '_')}.xml`;
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error generating MS Project file:', error);
    return NextResponse.json(
      { error: 'Failed to generate MS Project file', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/msproject/generate
 * Get information about the API endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/msproject/generate',
    method: 'POST',
    description: 'Generate MS Project XML file from WBS (Work Breakdown Structure) data',
    requestFormat: {
      projectData: {
        name: 'string (required)',
        startDate: 'ISO date string (optional, defaults to today)',
        company: 'string (optional)',
        manager: 'string (optional)'
      },
      tasks: 'array of task objects (required if wbsText not provided)',
      wbsText: 'text-based WBS format (required if tasks not provided)'
    },
    taskFormat: {
      name: 'string (required)',
      duration: 'number in days (optional, default: 1)',
      start: 'ISO date string (optional, defaults to project start)',
      priority: 'number 0-1000 (optional, default: 500)',
      percentComplete: 'number 0-100 (optional, default: 0)',
      notes: 'string (optional)',
      wbs: 'string (optional)',
      predecessors: 'array of task UIDs (optional)',
      children: 'array of child tasks (optional)'
    },
    textWBSFormat: {
      description: 'Simple text format with indentation',
      example: '1. Project Phase 1 (5 days)\\n  1.1. Task A (2 days)\\n  1.2. Task B (3 days)\\n2. Project Phase 2 (3 days)'
    },
    examples: {
      jsonFormat: {
        projectData: {
          name: 'Website Development',
          startDate: '2025-01-01',
          company: 'ACME Corp',
          manager: 'John Doe'
        },
        tasks: [
          {
            name: 'Planning Phase',
            duration: 10,
            children: [
              { name: 'Requirements Gathering', duration: 5 },
              { name: 'System Design', duration: 5 }
            ]
          },
          {
            name: 'Development Phase',
            duration: 20,
            children: [
              { name: 'Frontend Development', duration: 10 },
              { name: 'Backend Development', duration: 10 }
            ]
          }
        ]
      },
      textFormat: {
        projectData: {
          name: 'Website Development',
          startDate: '2025-01-01'
        },
        wbsText: '1. Planning Phase (10 days)\\n  1.1. Requirements Gathering (5 days)\\n  1.2. System Design (5 days)\\n2. Development Phase (20 days)\\n  2.1. Frontend Development (10 days)\\n  2.2. Backend Development (10 days)'
      }
    },
    response: 'MS Project XML file download'
  });
}
