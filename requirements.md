# Digital Accessibility Manual Reporting and Management

A module that manages digital accessibility manual testing projects with
the specified features.

- This app will have login.

- Accounts supported. Each account can have multiple projects and
  multiple users.

- A Project has a name and URL, and other information and consists of
  reported accessibility issues by an auditor. Each project contains:

  - Name

  - URL

  - Audit Type (WCAG version, level, etc)

  - Start date

  - End date

  - Auditors (users assigned to the project. Can be a customer user
    and/or an external auditor)

  - Completed %

  - Status (New, In Progress, In Queue, Completed)

  - Action buttons (Open/Expand, etc)

- The list of projects will contains 5 rows and a paging mechanism for
  more rows.

- Completed projects can be reopened for a retest. The Retest table will
  be listed below Active Audits (projects)

- Accessibility reports inside a project will have:

  - WCAG Success Criteria (example 111 Non-text Content)

  - WCAG version (WCAG 2.0)

  - Conformance level (A, AA, AAA)

  - Defect Summary / Category

  - Recommendation

  - User Impact

  - Comments

  - Disability Type

  - Pages -- Each page has the following in the table row:

    - Status

    - Page Name / Specific scenario

    - Severity (Critical, Serious, Moderate, Minor)

    - Screenshot (take by the auditor on the browser)

    - Remediators (assigned users)

    - Retest status

    - Actions -- Expanded to see communications

> Communication -- between users of the project. Each user can
> add/edit/delete a comment, comment a specific user, create screenshot
> (select status from a combobox, set the URL, save screenshot), comment
> as free text and then save/edit.

Here\'s a breakdown of the various screens and functionalities:

1\. User Roles:

Super Admin: Access to all features and all accounts in the system.

Account Admin: Access to all projects related to a specific account.

Project Admin: Full access to the project they are associated with.

User: Access to tasks related to the user.

2\. Screens:

Dashboard: Upon login, users will be directed to a dashboard showing an
overview of their projects, progress, and notifications. Each project in
the time frame will be marked as orange, the completed project will be
green, and the project that extends the due date will be red. Tasks that
still have not started will mark as gray, the projects will sort from
the newest as first row to the oldest as last row.

![A screenshot of a computer Description automatically
generated](media/image1.png){width="6.5in"
height="2.8930555555555557in"} ![A screenshot of a computer Description
automatically generated](media/image2.png){width="6.5in"
height="2.759027777777778in"}

Add New Project:

This screen allows Super Admin or Account Admin to create a new project.
Super admin needs to select the account first. It includes fields for
the project name, company name, website URL, sitemap URL, WCAG
guidelines -- select which WCAG guidelines will be part of the project:
for example, WCAG2.2 in Europe or WCAG2.0 in Israel, start/end dates,
estimated time (due date), Assigned Project admin, and assigned
auditor(s).

Edit Existing Project:

Super Admin, Account Admin, or Project Admin can edit the details of an
existing project.

Project Details:  
Zooming in on a specific project will display its details, including
progress percentage, list of related tasks, and other relevant
information.

Tasks List:

This screen shows a list of tasks related to a specific project. Each
task row includes the URL page and the tested WCAG criteria. Each
standard has a button to mark it as proper, improper, or skipped. The
user could use filters to navigate the relevant data quickly and
efficiently.

Task Detail:

If a WCAG standard (Success Criteria) is marked as improper, the user
can access a screen with details about the issue. This includes the
field to type in the defect description, recommended steps to fix it,
the user(auditor) that created it, time stamp, image/link attachments to
add additional info or location in the code (screenshot on the fly to
select an element or area in the browser) and a communication interface
for auditors working on the project.

Auditor Comments:

Users can add comments about the issues found, mention specific users,
including the WCAG criteria used and timestamps, including the purpose
of the case if it is testing or remediation, including necessary data
like browser, device, resolution, operation system, etc., and if it is
web, web application or native application testing.

In case the issue was already fixed by an external system, the auditor
can assign the external ID of the ticket created externally.

The status for this task will be "remediated using A11yCheck"

![A screenshot of a computer Description automatically
generated](media/image3.png){width="6.5in"
height="2.7993055555555557in"}

![A screenshot of a computer Description automatically
generated](media/image4.png){width="6.5in"
height="2.8965277777777776in"}

![A screenshot of a computer Description automatically
generated](media/image5.png){width="6.5in"
height="1.9159722222222222in"}

3\. Project Status Calculation:

The system will automatically calculate the project status based on the
number of completed tasks divided by the total number of tasks in the
project. Also, in case of remediation via A11yCheck (external tool), the
system will indicate how many defects from the absolute deficiency have
been remediated.

4\. Permissions and User Allocation:

The system will enforce role-based permissions, restricting users to
specific functionalities based on their roles.

Users cannot be allocated to multiple projects with overlapping
timeframes.

5\. Reports and Notifications:

The system will provide the ability to generate reports on project
status, progress, and other relevant metrics.

Notifications will be sent via email and through the system to customers
and Super Admin for various events and situations related to projects.

6\. Technology Stack:

Frontend:

React: Use React as the frontend framework to create the application\'s
user interface. React is a popular and robust framework for building
dynamic and responsive web applications.

The rest of the technology stack remains the same:

Backend:

Nest.js: Use Nest.js as the runtime environment for building the
application\'s backend. Nest.js is well-suited for building scalable and
real-time applications.

Microservices: Implement the system using a microservices architecture.
Divide the application into more minor, independent services to improve
modularity, scalability, and maintainability.

Docker: Containerize each microservice using Docker. Docker allows you
to package each service and its dependencies into a container, providing
consistency across different environments and simplifying deployment.

Database:

SQL Database: Use PostgreSQL to store structured data such as project
details, user information, and task information. SQL databases are
reliable and well-suited for handling structured data.

/\* not in scope

Elasticsearch: Utilize Elasticsearch as a search and analytics engine to
store and search unstructured data, such as auditor comments and issue
descriptions. Elasticsearch provides powerful full-text search
capabilities and is highly efficient for handling large volumes of
textual data.

\*/

Authentication and Authorization:

Implement a secure authentication mechanism using technologies like JSON
Web Tokens (JWT) to ensure that only authorized users can access the
system\'s functionalities.

Use role-based access control (RBAC) to manage permissions for different
user roles.

Communication between Microservices:

Implement communication between microservices using RESTful APIs or
message queues (e.g., RabbitMQ or Kafka) to enable seamless interaction
between different components.

Reporting and Notifications:

Implement a notification system using email services like SendGrid or
SMTP to send notifications to users and Super Admin for relevant events
and updates.

For reporting, you can use data visualization libraries like Chart.js or
D3.js to create dynamic and interactive charts and graphs.

Remember to check for any newer versions of React and consider using the
latest stable version for your project to take advantage of the latest
features, improvements, and security updates. Always refer to the
official React documentation for the most up-to-date information on the
framework.

1\. Dashboard Wireframe:

Top header with system logo on the left and user profile icon on the
right.

Sidebar navigation on the left with links to \'Projects\', \'Tasks\',
\'Reports\', \'User Profile\'.

Main content area showcasing an overview of projects with progress bars,
a list of recent notifications, and a quick view of upcoming tasks.

2\. Add New Project Wireframe:

Header with the title \'Add New Project\' and a back button.

Main content area with form fields for project name, project
description, start date, end date, and assignees.

A \'Save\' button at the bottom.

3\. Edit Existing Project Wireframe:

Header with the title \'Edit Project\' and a back button.

Form fields pre-filled with existing project details.

\'Save Changes\' and \'Delete Project\' buttons at the bottom.

4\. Project Details Wireframe:

Header showcasing project name.

Tabs for \'Overview\', \'Tasks\', \'Auditor Comments\'.

Main content area displaying details like project description, progress
bar, start and end dates.

A list of related tasks with their statuses.

5\. Tasks List Wireframe:

Header with \'Tasks for \[Project Name\]\' and an \'Add New Task\'
button.

A table or list view of tasks with columns/details like task name,
assignee, due date, and status.

6\. Task Detail Wireframe:

Header with task name and a back button.

Main content showcasing task details, a button to mark as
proper/improper, and a comments section.

7\. Auditor Comments Wireframe:

Header displaying \'Comments for \[Task Name\]\'.

Main content area displaying a threaded view of comments. A text box at
the bottom for users to add new comments.

8\. User Profile Wireframe:

Header with the title \'User Profile\'.

Main content area showing profile picture, name, email, and other
personal details with an \'Edit Profile\' button.

9\. Reports Wireframe:

Header titled \'Reports\'.

Dropdowns or buttons to select the type of report (e.g., project
progress, task statuses).

Main content area to display generated report with options to export or
print.

For the best visual representation, it\'s recommended to use wireframing
tools or collaborate with a UX/UI designer who can bring these
descriptions to life in visual form.

10\. Accessibility:

The design should be user-friendly and accessible to all users. Make
sure all elements and flows are accessible to people with disabilities,
always prefer native elements to Div's or other elements which are not
accessible. Comply to EAA accessibility ACT by providing an
accessibility statement, provide report an issue/bug functionality.

**[User Flow: Add New Project]{.underline}**

User Login:

Start at the Homepage/Login screen.

Enter credentials (username/email & password). Password must be
complicated by common practices and hints on complexity should be
provided to the user.

Click on the Login button.

Decision Node: Authentication successful? If yes, proceed to the
Dashboard. If no, show an error message and allow the user to try again.

Access Dashboard:

Arrive at the Dashboard.

Overview of projects, notifications, and other relevant dashboard info
is visible.

Decision Node: Does the user want to add a new project? If yes, click on
the \'Add New Project\' button. If no, user continues browsing the
dashboard or navigates elsewhere.

Initiate New Project:

Click on the \'Add New Project\' button or link from the Dashboard or
Sidebar (if available).

Redirected to the \'Add New Project\' screen.

Enter Project Details:

Fill out the project form with necessary fields such as project name,
description, start date, end date, assignees, etc.

Decision Node: Is all mandatory information provided? If yes, user can
proceed to save. If no, highlight missing fields in the form. Maintain
accessible validation to fields and form.

Save & Confirmation:

Click on the \'Save\' button.

The system processes the input.

The user is redirected to a confirmation screen or a popup message
confirming the project has been added. Alternatively, the user could be
directed back to the updated dashboard with the new project now visible.

Navigation Options Post-Save:

Decision Node: What does the user want to do next? Options can include
navigating back to the dashboard, adding another project, viewing the
project details of the recently added project, or logging out.

**[User Flow: Add New Task Details]{.underline}**

Access Project:

Start from the Dashboard after logging in.

The dashboard showcases an overview of projects.

Users select a specific project where they want to add a new task.

User clicks on the project title, or the \"View Details\" button/link
associated with the project.

Inside the Project:

Arrive at the Project Details screen.

User views the \'Tasks\' tab or section showcasing a list of existing
tasks.

Above or below the list, there\'s an \'Add New Task\' button or link.

Initiate New Task:

User clicks on the \'Add New Task\' button or link.

Redirected to the \'Add New Task Details\' screen.

Enter Task Details:

User fills out the task details form with fields like:

Task Name (text field)

Task Description (textarea)

Due Date (date picker)

Assignee (dropdown or user selector)

Priority (radio buttons or dropdown: High, Medium, Low)

Any other fields relevant to the system.

Decision Node: Has the user filled all mandatory fields? If yes, they
can proceed to save. If no, highlight the missing fields or show an
error message. Maintain accessible validation to fields and form.

Save & Confirmation:

User clicks on the \'Save\' or \'Add Task\' button.

System processes the input.

Upon successful addition, the user receives a confirmation message
(e.g., \"Task successfully added!\") either as a popup or integrated
into the next screen.

User is then redirected to the updated task list inside the project
where the new task is now visible.

Post-Task Addition Options:

Decision Node: What\'s the next action for the user? Options might
include:

Navigating back to the project details.

Adding another task.

Viewing the detailed view of the recently added task.

Editing the task they just added.

Returning to the dashboard.

Logging out.
