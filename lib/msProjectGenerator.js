/**
 * MS Project XML Generator
 * Generates MS Project compatible XML files from WBS (Work Breakdown Structure) data
 * Compatible with MS Project 2003+ XML format
 */

/**
 * Generate MS Project XML from WBS data
 * @param {Object} projectData - Project metadata
 * @param {Array} tasks - Array of task objects with WBS structure
 * @returns {string} MS Project XML string
 */
export function generateMSProjectXML(projectData, tasks) {
  const { name, startDate, company, manager } = projectData;
  const projectStart = new Date(startDate || Date.now());
  
  // Process tasks first to calculate project end date
  const processedTasks = processTasks(tasks, projectStart);
  
  // Calculate project end date based on all tasks
  let projectEnd = new Date(projectStart);
  processedTasks.forEach(task => {
    const taskStart = new Date(task.start);
    const taskEnd = new Date(taskStart);
    taskEnd.setDate(taskEnd.getDate() + Math.max(0, parseInt(task.duration) - 1));
    if (taskEnd > projectEnd) {
      projectEnd = taskEnd;
    }
  });
  
  // Build XML structure
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>${escapeXml(name || 'Project')}</Name>
  <Title>${escapeXml(name || 'Project')}</Title>
  <Company>${escapeXml(company || '')}</Company>
  <Manager>${escapeXml(manager || '')}</Manager>
  <StartDate>${formatDate(projectStart)}</StartDate>
  <CurrencySymbol>$</CurrencySymbol>
  <DefaultTaskType>1</DefaultTaskType>
  <DefaultFixedCostAccrual>3</DefaultFixedCostAccrual>
  <Tasks>`;

  // Add summary task (project root)
  xml += `
    <Task>
      <UID>0</UID>
      <ID>0</ID>
      <Name>${escapeXml(name || 'Project Summary')}</Name>
      <Type>1</Type>
      <IsNull>0</IsNull>
      <CreateDate>${formatDate(projectStart)}</CreateDate>
      <OutlineLevel>0</OutlineLevel>
      <Priority>500</Priority>
      <Start>${formatDate(projectStart)}</Start>
      <Finish>${formatDate(projectEnd)}</Finish>
      <Summary>1</Summary>
      <ManualStart>${formatDate(projectStart)}</ManualStart>
      <ManualFinish>${formatDate(projectEnd)}</ManualFinish>
    </Task>`;
  
  processedTasks.forEach((task, index) => {
    xml += generateTaskXML(task, index + 1, projectStart);
  });

  xml += `
  </Tasks>
  <Resources/>
  <Assignments/>
</Project>`;

  return xml;
}

/**
 * Process tasks to ensure proper hierarchy and structure
 * @param {Array} tasks - Raw task data
 * @param {Date} projectStart - Project start date
 * @returns {Array} Processed tasks with proper IDs and structure
 */
function processTasks(tasks, projectStart) {
  if (!Array.isArray(tasks)) {
    return [];
  }

  const processed = [];
  let uid = 1;

  function processTask(task, parentId = null, outlineLevel = 1) {
    const processedTask = {
      uid: uid++,
      id: processed.length + 1,
      name: task.name || `Task ${processed.length + 1}`,
      duration: task.duration || 1,
      outlineLevel: outlineLevel,
      parentId: parentId,
      start: task.start || projectStart,
      predecessors: task.predecessors || [],
      notes: task.notes || '',
      priority: task.priority || 500,
      percentComplete: task.percentComplete || 0,
      isSummary: task.children && task.children.length > 0,
      wbs: task.wbs || ''
    };

    processed.push(processedTask);

    // Process children recursively
    if (task.children && Array.isArray(task.children)) {
      task.children.forEach(child => {
        processTask(child, processedTask.uid, outlineLevel + 1);
      });
    }
  }

  tasks.forEach(task => processTask(task));
  return processed;
}

/**
 * Generate XML for a single task
 * @param {Object} task - Task object
 * @param {number} id - Task ID
 * @param {Date} projectStart - Project start date
 * @returns {string} Task XML string
 */
function generateTaskXML(task, id, projectStart) {
  const startDate = new Date(task.start);
  const finishDate = new Date(startDate);
  finishDate.setDate(finishDate.getDate() + Math.max(0, parseInt(task.duration) - 1));

  let xml = `
    <Task>
      <UID>${task.uid}</UID>
      <ID>${id}</ID>
      <Name>${escapeXml(task.name)}</Name>
      <Type>1</Type>
      <IsNull>0</IsNull>
      <CreateDate>${formatDate(projectStart)}</CreateDate>
      <WBS>${escapeXml(task.wbs || task.uid.toString())}</WBS>
      <OutlineLevel>${task.outlineLevel}</OutlineLevel>
      <Priority>${task.priority}</Priority>
      <Start>${formatDate(startDate)}</Start>
      <Finish>${formatDate(finishDate)}</Finish>
      <Duration>PT${task.duration * 8}H0M0S</Duration>
      <ManualStart>${formatDate(startDate)}</ManualStart>
      <ManualFinish>${formatDate(finishDate)}</ManualFinish>
      <ManualDuration>PT${task.duration * 8}H0M0S</ManualDuration>
      <DurationFormat>7</DurationFormat>
      <Work>PT${task.duration * 8}H0M0S</Work>
      <PercentComplete>${task.percentComplete}</PercentComplete>
      <PercentWorkComplete>${task.percentComplete}</PercentWorkComplete>`;

  if (task.isSummary) {
    xml += `
      <Summary>1</Summary>`;
  }

  if (task.notes) {
    xml += `
      <Notes>${escapeXml(task.notes)}</Notes>`;
  }

  // Add predecessor links
  if (task.predecessors && task.predecessors.length > 0) {
    task.predecessors.forEach(pred => {
      xml += `
      <PredecessorLink>
        <PredecessorUID>${pred}</PredecessorUID>
        <Type>1</Type>
        <CrossProject>0</CrossProject>
        <LinkLag>0</LinkLag>
        <LagFormat>7</LagFormat>
      </PredecessorLink>`;
    });
  }

  xml += `
    </Task>`;

  return xml;
}

/**
 * Format date for MS Project XML
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString();
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Parse WBS data from various formats
 * @param {string|Object} wbsData - WBS data in string or object format
 * @returns {Array} Array of task objects
 */
export function parseWBSData(wbsData) {
  if (!wbsData) return [];

  // If already an object/array, return it
  if (typeof wbsData === 'object') {
    return Array.isArray(wbsData) ? wbsData : [wbsData];
  }

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(wbsData);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    // If not JSON, try to parse as simple text format
    return parseTextWBS(wbsData);
  }
}

/**
 * Parse text-based WBS format
 * Example format:
 * 1. Project Phase 1 (5 days)
 *   1.1. Task A (2 days)
 *   1.2. Task B (3 days)
 * 2. Project Phase 2 (3 days)
 * @param {string} text - Text-based WBS
 * @returns {Array} Array of task objects
 */
function parseTextWBS(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const tasks = [];
  const stack = [{ children: tasks, level: -1 }];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Determine indentation level
    const indent = line.search(/\S/);
    const level = Math.floor(indent / 2);

    // Extract task info
    const match = trimmed.match(/^(?:(\d+(?:\.\d+)*)\s+)?(.+?)(?:\s*\((\d+)\s*days?\))?$/i);
    if (!match) return;

    const wbs = match[1] || '';
    const name = match[2].trim();
    const duration = match[3] ? parseInt(match[3]) : 1;

    const task = {
      name,
      duration,
      children: [],
      wbs: wbs
    };

    // Find parent based on level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1];
      parent.children.push(task);
    }

    stack.push({ ...task, level });
  });

  return tasks;
}

/**
 * Validate WBS data structure
 * @param {Array} tasks - Task array to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateWBSData(tasks) {
  const errors = [];

  if (!Array.isArray(tasks)) {
    errors.push('WBS data must be an array of tasks');
    return { isValid: false, errors };
  }

  if (tasks.length === 0) {
    errors.push('WBS data must contain at least one task');
    return { isValid: false, errors };
  }

  function validateTask(task, index, path = '') {
    const taskPath = `${path}Task[${index}]`;

    if (!task.name || typeof task.name !== 'string') {
      errors.push(`${taskPath}: Task must have a valid name`);
    }

    if (task.duration !== undefined) {
      const duration = parseInt(task.duration);
      if (isNaN(duration) || duration < 0) {
        errors.push(`${taskPath}: Duration must be a positive number`);
      }
    }

    if (task.children && Array.isArray(task.children)) {
      task.children.forEach((child, childIndex) => {
        validateTask(child, childIndex, `${taskPath}.children.`);
      });
    }
  }

  tasks.forEach((task, index) => validateTask(task, index));

  return {
    isValid: errors.length === 0,
    errors
  };
}
