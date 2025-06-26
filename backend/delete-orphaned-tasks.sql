-- Delete orphaned tasks and their associated messages
-- First, delete all task messages for orphaned tasks
DELETE FROM task_message 
WHERE "taskId" IN (
    SELECT id FROM task WHERE "pageId" IS NULL
);

-- Then delete the orphaned tasks
DELETE FROM task 
WHERE "pageId" IS NULL;

-- Optional: Show how many tasks were deleted
-- SELECT COUNT(*) as deleted_tasks FROM task WHERE "pageId" IS NULL; 