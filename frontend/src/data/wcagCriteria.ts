export interface WCAGCriteria {
  id: string;
  name: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  version: '2.0' | '2.1';
  category: 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  defectSummary: string;
  recommendation: string;
  userImpact: string;
  disabilityType: ('Vision' | 'Hearing' | 'Motor' | 'Cognitive' | 'Speech')[];
}

export const WCAG_CRITERIA: WCAGCriteria[] = [
  // Perceivable - WCAG 2.0
  {
    id: '1.1.1',
    name: 'Non-text Content',
    description: 'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'Critical',
    defectSummary: 'Images, icons, and other non-text content lack proper text alternatives, making them inaccessible to screen readers and other assistive technologies.',
    recommendation: 'Provide descriptive alt text for all images, icons, and non-text content. Use aria-label or aria-labelledby for complex graphics. Ensure decorative images have empty alt attributes.',
    userImpact: 'Users with visual impairments cannot understand the content or purpose of images and graphics, significantly limiting their ability to use the application effectively.',
    disabilityType: ['Vision']
  },
  {
    id: '1.2.1',
    name: 'Audio-only and Video-only (Prerecorded)',
    description: 'For prerecorded audio-only and prerecorded video-only media, an alternative is provided.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Audio-only and video-only content lacks text alternatives, making the information inaccessible to users with hearing or visual impairments.',
    recommendation: 'Provide transcripts for audio-only content and descriptions for video-only content. Ensure all media has equivalent text alternatives.',
    userImpact: 'Users with hearing impairments cannot access audio content, and users with visual impairments cannot access video-only content.',
    disabilityType: ['Vision', 'Hearing']
  },
  {
    id: '1.2.2',
    name: 'Captions (Prerecorded)',
    description: 'Captions are provided for all prerecorded audio content in synchronized media.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Video content with audio lacks captions, making it inaccessible to users with hearing impairments.',
    recommendation: 'Provide accurate, synchronized captions for all video content. Ensure captions include speaker identification and sound effects.',
    userImpact: 'Users with hearing impairments cannot understand the audio content in videos, missing critical information.',
    disabilityType: ['Hearing']
  },
  {
    id: '1.2.3',
    name: 'Audio Description or Media Alternative (Prerecorded)',
    description: 'An alternative for time-based media or audio description of the prerecorded video content is provided.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Video content lacks audio descriptions, making visual information inaccessible to users with visual impairments.',
    recommendation: 'Provide audio descriptions for video content or offer a text-based alternative that describes all visual information.',
    userImpact: 'Users with visual impairments miss important visual information in videos that is not conveyed through audio alone.',
    disabilityType: ['Vision']
  },
  {
    id: '1.2.4',
    name: 'Captions (Live)',
    description: 'Captions are provided for all live audio content in synchronized media.',
    level: 'AA',
    version: '2.0',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Live video content lacks real-time captions, excluding users with hearing impairments from live events and presentations.',
    recommendation: 'Implement real-time captioning for live video content. Use professional captioning services or automated solutions with human oversight.',
    userImpact: 'Users with hearing impairments cannot participate in live events, webinars, or real-time communications.',
    disabilityType: ['Hearing']
  },
  {
    id: '1.2.5',
    name: 'Audio Description (Prerecorded)',
    description: 'Audio description is provided for all prerecorded video content in synchronized media.',
    level: 'AA',
    version: '2.0',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'Video content lacks audio descriptions, making visual information inaccessible to users with visual impairments.',
    recommendation: 'Provide audio descriptions for all video content, describing important visual elements that are not conveyed through audio.',
    userImpact: 'Users with visual impairments miss contextual visual information that enhances understanding of the content.',
    disabilityType: ['Vision']
  },
  {
    id: '1.3.1',
    name: 'Info and Relationships',
    description: 'Information, structure, and relationships conveyed through presentation can be programmatically determined.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'Critical',
    defectSummary: 'Content structure and relationships are only conveyed visually, making them inaccessible to assistive technologies.',
    recommendation: 'Use semantic HTML elements (headings, lists, tables, forms). Implement proper ARIA roles and labels. Ensure logical document structure.',
    userImpact: 'Users with assistive technologies cannot understand the structure and relationships of content, making navigation and comprehension difficult.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '1.3.2',
    name: 'Meaningful Sequence',
    description: 'When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Content reading order is not logical or cannot be determined programmatically, confusing users of assistive technologies.',
    recommendation: 'Ensure content flows in a logical reading order. Use proper HTML structure and avoid CSS positioning that creates illogical reading sequences.',
    userImpact: 'Users with screen readers encounter content in a confusing or meaningless order, making comprehension impossible.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '1.3.3',
    name: 'Sensory Characteristics',
    description: 'Instructions provided for understanding and operating content do not rely solely on sensory characteristics.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'Instructions rely on visual, auditory, or other sensory characteristics that some users cannot perceive.',
    recommendation: 'Provide instructions that do not depend on sensory characteristics. Use multiple cues (text, icons, labels) to convey information.',
    userImpact: 'Users with sensory impairments cannot follow instructions that rely on characteristics they cannot perceive.',
    disabilityType: ['Vision', 'Hearing', 'Cognitive']
  },
  {
    id: '1.4.1',
    name: 'Use of Color',
    description: 'Color is not used as the only visual means of conveying information.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Information is conveyed only through color, making it inaccessible to users with color blindness or visual impairments.',
    recommendation: 'Use multiple visual cues (text, icons, patterns) in addition to color. Ensure sufficient contrast ratios. Test with color blindness simulators.',
    userImpact: 'Users with color blindness or visual impairments cannot distinguish between different states or understand important information.',
    disabilityType: ['Vision']
  },
  {
    id: '1.4.2',
    name: 'Audio Control',
    description: 'If any audio on a Web page plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio.',
    level: 'A',
    version: '2.0',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'Audio plays automatically without user control, creating accessibility barriers and potential conflicts with assistive technologies.',
    recommendation: 'Avoid auto-playing audio. If necessary, provide clear controls to pause, stop, or adjust volume. Allow users to disable auto-play.',
    userImpact: 'Users with hearing impairments, cognitive disabilities, or those using screen readers may be distracted or unable to focus on content.',
    disabilityType: ['Hearing', 'Cognitive']
  },
  {
    id: '1.4.3',
    name: 'Contrast (Minimum)',
    description: 'The visual presentation of text and images of text has a contrast ratio of at least 4.5:1.',
    level: 'AA',
    version: '2.0',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Text lacks sufficient contrast against background colors, making it difficult or impossible to read for users with visual impairments.',
    recommendation: 'Ensure text has a contrast ratio of at least 4.5:1 (3:1 for large text). Use contrast checking tools to verify ratios.',
    userImpact: 'Users with low vision or color blindness cannot read text content, making the application unusable.',
    disabilityType: ['Vision']
  },
  {
    id: '1.4.4',
    name: 'Resize Text',
    description: 'Text can be resized without assistive technology up to 200 percent without loss of content or functionality.',
    level: 'AA',
    version: '2.0',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Text cannot be resized to 200% without horizontal scrolling or loss of functionality, limiting accessibility for users with low vision.',
    recommendation: 'Use relative units (em, rem, %) for text sizing. Avoid fixed pixel sizes. Ensure layout remains functional at 200% zoom.',
    userImpact: 'Users with low vision cannot increase text size to a readable level, making content inaccessible.',
    disabilityType: ['Vision']
  },
  {
    id: '1.4.5',
    name: 'Images of Text',
    description: 'If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.',
    level: 'AA',
    version: '2.0',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'Text is presented as images, making it inaccessible to screen readers and preventing users from customizing text appearance.',
    recommendation: 'Use actual text instead of images of text. If images of text are necessary, provide equivalent text alternatives.',
    userImpact: 'Users with visual impairments cannot read text in images, and all users lose the ability to customize text appearance.',
    disabilityType: ['Vision']
  },

  // Perceivable - WCAG 2.1
  {
    id: '1.3.4',
    name: 'Orientation',
    description: 'Content does not restrict its view and operation to a single display orientation.',
    level: 'AA',
    version: '2.1',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'Content is locked to a specific orientation (portrait or landscape), preventing users from viewing content in their preferred orientation.',
    recommendation: 'Allow content to be viewed in both portrait and landscape orientations. Avoid CSS that locks orientation.',
    userImpact: 'Users with physical disabilities or those using mounted devices cannot rotate their device to view content comfortably.',
    disabilityType: ['Motor']
  },
  {
    id: '1.3.5',
    name: 'Identify Input Purpose',
    description: 'The purpose of each input field collecting information about the user can be programmatically determined.',
    level: 'AA',
    version: '2.1',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'Form input fields lack proper identification of their purpose, making them difficult to use with assistive technologies.',
    recommendation: 'Use appropriate input types and autocomplete attributes. Provide clear labels and descriptions for form fields.',
    userImpact: 'Users with cognitive disabilities and those using assistive technologies cannot easily understand what information is required.',
    disabilityType: ['Cognitive']
  },
  {
    id: '1.4.10',
    name: 'Reflow',
    description: 'Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions.',
    level: 'AA',
    version: '2.1',
    category: 'Perceivable',
    severity: 'High',
    defectSummary: 'Content requires horizontal scrolling or has fixed widths that prevent proper reflow on smaller screens.',
    recommendation: 'Use responsive design principles. Avoid fixed widths and ensure content reflows to fit different screen sizes.',
    userImpact: 'Users with low vision who zoom in, or those using mobile devices, must scroll horizontally to read content.',
    disabilityType: ['Vision', 'Motor']
  },
  {
    id: '1.4.11',
    name: 'Non-text Contrast',
    description: 'The visual presentation of user interface components and graphical objects has a contrast ratio of at least 3:1.',
    level: 'AA',
    version: '2.1',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'UI components, icons, and graphics lack sufficient contrast, making them difficult to distinguish for users with visual impairments.',
    recommendation: 'Ensure UI components have a contrast ratio of at least 3:1. Test borders, icons, and interactive elements.',
    userImpact: 'Users with low vision cannot distinguish between UI elements, making navigation and interaction difficult.',
    disabilityType: ['Vision']
  },
  {
    id: '1.4.12',
    name: 'Text Spacing',
    description: 'In content implemented using markup languages that support text style properties, no loss of content or functionality occurs.',
    level: 'AA',
    version: '2.1',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'Text spacing cannot be adjusted by users, preventing those with reading disabilities from customizing text appearance.',
    recommendation: 'Allow users to adjust line height, paragraph spacing, letter spacing, and word spacing without breaking layout.',
    userImpact: 'Users with dyslexia or other reading disabilities cannot adjust text spacing to improve readability.',
    disabilityType: ['Cognitive']
  },
  {
    id: '1.4.13',
    name: 'Content on Hover or Focus',
    description: 'Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden.',
    level: 'AA',
    version: '2.1',
    category: 'Perceivable',
    severity: 'Medium',
    defectSummary: 'Content appears on hover or focus but disappears when the trigger is removed, making it difficult to interact with.',
    recommendation: 'Provide a mechanism to dismiss hover/focus content. Ensure content remains visible until dismissed or focus moves.',
    userImpact: 'Users with motor disabilities or those using keyboard navigation cannot interact with content that disappears too quickly.',
    disabilityType: ['Motor', 'Cognitive']
  },

  // Operable - WCAG 2.0
  {
    id: '2.1.1',
    name: 'Keyboard',
    description: 'All functionality of the content is operable through a keyboard interface.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'Critical',
    defectSummary: 'Functionality requires mouse interaction and cannot be accessed via keyboard, excluding users with motor disabilities.',
    recommendation: 'Ensure all interactive elements are keyboard accessible. Implement proper focus management and keyboard event handlers.',
    userImpact: 'Users with motor disabilities, those using assistive technologies, and keyboard-only users cannot access functionality.',
    disabilityType: ['Motor']
  },
  {
    id: '2.1.2',
    name: 'No Keyboard Trap',
    description: 'If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'Critical',
    defectSummary: 'Keyboard focus becomes trapped within a component, preventing users from navigating away using the keyboard.',
    recommendation: 'Ensure focus can always be moved away from components using standard keyboard navigation (Tab, Escape, etc.).',
    userImpact: 'Users with motor disabilities become trapped in interface components and cannot continue using the application.',
    disabilityType: ['Motor']
  },
  {
    id: '2.2.1',
    name: 'Timing Adjustable',
    description: 'For each time limit that is set by the content, at least one of the following is true.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'High',
    defectSummary: 'Time limits are imposed without options to adjust, extend, or turn them off, excluding users who need more time.',
    recommendation: 'Allow users to turn off, adjust, or extend time limits. Provide warnings before time expires.',
    userImpact: 'Users with cognitive disabilities, motor impairments, or those who need more time to complete tasks are excluded.',
    disabilityType: ['Cognitive', 'Motor']
  },
  {
    id: '2.2.2',
    name: 'Pause, Stop, Hide',
    description: 'For moving, blinking, scrolling, or auto-updating information, all of the following are true.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'Medium',
    defectSummary: 'Moving, blinking, or auto-updating content cannot be paused, stopped, or hidden, creating distractions and accessibility barriers.',
    recommendation: 'Provide controls to pause, stop, or hide moving content. Allow users to control auto-updating information.',
    userImpact: 'Users with cognitive disabilities, attention disorders, or those using screen readers are distracted or confused.',
    disabilityType: ['Cognitive']
  },
  {
    id: '2.3.1',
    name: 'Three Flashes or Below Threshold',
    description: 'Web pages do not contain anything that flashes more than three times in any one second period.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'Critical',
    defectSummary: 'Content flashes more than three times per second, potentially triggering seizures in users with photosensitive epilepsy.',
    recommendation: 'Avoid flashing content. If necessary, ensure it flashes no more than three times per second and covers a small area.',
    userImpact: 'Users with photosensitive epilepsy may experience seizures from flashing content.',
    disabilityType: ['Cognitive']
  },
  {
    id: '2.4.1',
    name: 'Bypass Blocks',
    description: 'A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'High',
    defectSummary: 'No mechanism exists to skip repeated navigation blocks, forcing users to navigate through the same content repeatedly.',
    recommendation: 'Implement skip links, landmarks, or other mechanisms to bypass repeated content blocks.',
    userImpact: 'Users with motor disabilities or those using keyboard navigation must navigate through repetitive content on every page.',
    disabilityType: ['Motor']
  },
  {
    id: '2.4.2',
    name: 'Page Titled',
    description: 'Web pages have titles that describe topic or purpose.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'Medium',
    defectSummary: 'Pages lack descriptive titles, making navigation and identification difficult for users of assistive technologies.',
    recommendation: 'Provide unique, descriptive page titles that clearly indicate the page content and purpose.',
    userImpact: 'Users with screen readers cannot easily identify pages, and all users lose context when multiple tabs are open.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '2.4.3',
    name: 'Focus Order',
    description: 'If a Web page can be navigated sequentially and the navigation sequences affect meaning or operation.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'High',
    defectSummary: 'Focus order does not follow a logical sequence, confusing users who navigate with keyboard or assistive technologies.',
    recommendation: 'Ensure focus order follows the logical reading order of the page. Use tabindex sparingly and appropriately.',
    userImpact: 'Users with motor disabilities or those using keyboard navigation encounter content in a confusing order.',
    disabilityType: ['Motor', 'Cognitive']
  },
  {
    id: '2.4.4',
    name: 'Link Purpose (In Context)',
    description: 'The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.',
    level: 'A',
    version: '2.0',
    category: 'Operable',
    severity: 'High',
    defectSummary: 'Link text is not descriptive or clear, making it difficult to understand the link purpose out of context.',
    recommendation: 'Use descriptive link text that clearly indicates the destination or action. Avoid generic text like "click here" or "more".',
    userImpact: 'Users with screen readers cannot understand link purposes, and all users lose context when links are viewed out of context.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '2.4.5',
    name: 'Multiple Ways',
    description: 'More than one way is available to locate a Web page within a set of Web pages.',
    level: 'AA',
    version: '2.0',
    category: 'Operable',
    severity: 'Medium',
    defectSummary: 'Only one navigation method is available, limiting users who may prefer different ways to find content.',
    recommendation: 'Provide multiple navigation options: site map, search, navigation menu, breadcrumbs, or related links.',
    userImpact: 'Users with different abilities and preferences cannot find content using their preferred navigation method.',
    disabilityType: ['Cognitive', 'Motor']
  },
  {
    id: '2.4.6',
    name: 'Headings and Labels',
    description: 'Headings and labels describe topic or purpose.',
    level: 'AA',
    version: '2.0',
    category: 'Operable',
    severity: 'High',
    defectSummary: 'Headings and labels are not descriptive or clear, making content structure and purpose difficult to understand.',
    recommendation: 'Use descriptive headings that clearly indicate the content that follows. Provide clear, specific labels for form fields.',
    userImpact: 'Users with screen readers cannot understand content structure, and all users have difficulty navigating and understanding content.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '2.4.7',
    name: 'Focus Visible',
    description: 'Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.',
    level: 'AA',
    version: '2.0',
    category: 'Operable',
    severity: 'High',
    defectSummary: 'Keyboard focus is not visible, making it impossible for users to know which element has focus.',
    recommendation: 'Ensure focus indicators are clearly visible with sufficient contrast. Do not remove focus indicators with CSS.',
    userImpact: 'Users with motor disabilities or those using keyboard navigation cannot determine which element has focus.',
    disabilityType: ['Vision', 'Motor']
  },

  // Operable - WCAG 2.1
  {
    id: '2.1.4',
    name: 'Single Character Key Shortcuts',
    description: 'If a keyboard shortcut is implemented in content using only letter, punctuation, number, or symbol characters.',
    level: 'A',
    version: '2.1',
    category: 'Operable',
    severity: 'Medium',
    defectSummary: 'Single-character keyboard shortcuts conflict with assistive technologies and cannot be turned off or remapped.',
    recommendation: 'Allow users to turn off single-character shortcuts or remap them. Provide alternative ways to access functionality.',
    userImpact: 'Users with motor disabilities or those using assistive technologies may accidentally trigger shortcuts.',
    disabilityType: ['Motor']
  },
  {
    id: '2.5.1',
    name: 'Pointer Gestures',
    description: 'All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer.',
    level: 'A',
    version: '2.1',
    category: 'Operable',
    severity: 'High',
    defectSummary: 'Functionality requires complex gestures (pinch, swipe, multi-finger) that users with motor disabilities cannot perform.',
    recommendation: 'Provide single-pointer alternatives for all multi-point or path-based gestures. Use simple tap or click interactions.',
    userImpact: 'Users with motor disabilities, those using assistive technologies, or those with limited dexterity cannot access functionality.',
    disabilityType: ['Motor']
  },
  {
    id: '2.5.2',
    name: 'Pointer Cancellation',
    description: 'For functionality that can be operated using a single pointer, at least one of the following is true.',
    level: 'A',
    version: '2.1',
    category: 'Operable',
    severity: 'Medium',
    defectSummary: 'Actions are triggered on pointer down rather than pointer up, preventing users from canceling accidental activations.',
    recommendation: 'Trigger actions on pointer up rather than pointer down. Provide a mechanism to cancel actions before completion.',
    userImpact: 'Users with motor disabilities may accidentally trigger actions they cannot cancel.',
    disabilityType: ['Motor']
  },
  {
    id: '2.5.3',
    name: 'Label in Name',
    description: 'For user interface components with labels that include text or images of text, the name contains the text that is presented visually.',
    level: 'A',
    version: '2.1',
    category: 'Operable',
    severity: 'Medium',
    defectSummary: 'Accessible names do not match visible labels, confusing users of assistive technologies.',
    recommendation: 'Ensure accessible names (aria-label, aria-labelledby) match or include the visible label text.',
    userImpact: 'Users with screen readers hear different text than what is visible, creating confusion and inconsistency.',
    disabilityType: ['Vision']
  },
  {
    id: '2.5.4',
    name: 'Motion Actuation',
    description: 'Functionality that can be operated by device motion or user motion can also be operated by user interface components.',
    level: 'A',
    version: '2.1',
    category: 'Operable',
    severity: 'Medium',
    defectSummary: 'Functionality requires device motion (shaking, tilting) without alternative interface controls.',
    recommendation: 'Provide alternative interface controls for all motion-activated functionality. Allow users to disable motion detection.',
    userImpact: 'Users with motor disabilities, those using mounted devices, or those who cannot perform motion gestures cannot access functionality.',
    disabilityType: ['Motor']
  },

  // Understandable - WCAG 2.0
  {
    id: '3.1.1',
    name: 'Language of Page',
    description: 'The default human language of each Web page can be programmatically determined.',
    level: 'A',
    version: '2.0',
    category: 'Understandable',
    severity: 'Medium',
    defectSummary: 'Page language is not specified, preventing assistive technologies from using correct pronunciation and language settings.',
    recommendation: 'Set the lang attribute on the html element to indicate the primary language of the page.',
    userImpact: 'Users with screen readers may hear incorrect pronunciation, and language-specific features may not work properly.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '3.1.2',
    name: 'Language of Parts',
    description: 'The human language of each passage or phrase in the content can be programmatically determined.',
    level: 'AA',
    version: '2.0',
    category: 'Understandable',
    severity: 'Medium',
    defectSummary: 'Content in different languages lacks proper language identification, causing pronunciation and comprehension issues.',
    recommendation: 'Use lang attributes on elements containing content in different languages from the page default.',
    userImpact: 'Users with screen readers hear incorrect pronunciation of foreign language content.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '3.2.1',
    name: 'On Focus',
    description: 'When any component receives focus, it does not initiate a change of context.',
    level: 'A',
    version: '2.0',
    category: 'Understandable',
    severity: 'High',
    defectSummary: 'Focusing on elements automatically changes context (navigates, submits forms, opens windows), creating unexpected behavior.',
    recommendation: 'Avoid automatic context changes on focus. Require explicit user action (click, enter) for context changes.',
    userImpact: 'Users with motor disabilities or those using keyboard navigation experience unexpected navigation or actions.',
    disabilityType: ['Motor', 'Cognitive']
  },
  {
    id: '3.2.2',
    name: 'On Input',
    description: 'Changing the setting of any user interface component does not automatically cause a change of context.',
    level: 'A',
    version: '2.0',
    category: 'Understandable',
    severity: 'High',
    defectSummary: 'Changing form controls automatically triggers context changes, creating unexpected behavior and potential data loss.',
    recommendation: 'Require explicit user action for context changes. Provide clear warnings before automatic submissions or navigation.',
    userImpact: 'Users may lose data or be taken to unexpected locations when adjusting form controls.',
    disabilityType: ['Motor', 'Cognitive']
  },
  {
    id: '3.2.3',
    name: 'Consistent Navigation',
    description: 'Navigational mechanisms that are repeated on multiple Web pages within a set of Web pages occur in the same relative order each time they are repeated.',
    level: 'AA',
    version: '2.0',
    category: 'Understandable',
    severity: 'Medium',
    defectSummary: 'Navigation elements change position or order across pages, making navigation confusing and unpredictable.',
    recommendation: 'Maintain consistent navigation structure across all pages. Keep navigation elements in the same relative positions.',
    userImpact: 'Users with cognitive disabilities or those using assistive technologies cannot rely on consistent navigation patterns.',
    disabilityType: ['Cognitive']
  },
  {
    id: '3.2.4',
    name: 'Consistent Identification',
    description: 'Components that have the same functionality within a set of Web pages are identified consistently.',
    level: 'AA',
    version: '2.0',
    category: 'Understandable',
    severity: 'Medium',
    defectSummary: 'Similar functionality is labeled or identified differently across pages, creating confusion and inconsistency.',
    recommendation: 'Use consistent labels, icons, and identification for components with the same functionality across all pages.',
    userImpact: 'Users with cognitive disabilities cannot rely on consistent component identification and may miss functionality.',
    disabilityType: ['Cognitive']
  },
  {
    id: '3.3.1',
    name: 'Error Identification',
    description: 'If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.',
    level: 'A',
    version: '2.0',
    category: 'Understandable',
    severity: 'High',
    defectSummary: 'Form errors are not clearly identified or described, making it difficult for users to understand and correct mistakes.',
    recommendation: 'Clearly identify fields with errors and provide specific, helpful error messages in text format.',
    userImpact: 'Users cannot understand what went wrong or how to fix errors, preventing successful form completion.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '3.3.2',
    name: 'Labels or Instructions',
    description: 'Labels or instructions are provided when content requires user input.',
    level: 'A',
    version: '2.0',
    category: 'Understandable',
    severity: 'High',
    defectSummary: 'Form fields lack clear labels or instructions, making it difficult to understand what information is required.',
    recommendation: 'Provide clear, descriptive labels for all form fields. Include instructions for complex or unusual input requirements.',
    userImpact: 'Users cannot understand what information is required or how to provide it correctly.',
    disabilityType: ['Vision', 'Cognitive']
  },
  {
    id: '3.3.3',
    name: 'Error Suggestion',
    description: 'If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user.',
    level: 'AA',
    version: '2.0',
    category: 'Understandable',
    severity: 'Medium',
    defectSummary: 'Error messages do not provide helpful suggestions for correction, leaving users unsure how to fix problems.',
    recommendation: 'Provide specific suggestions for correcting errors when possible. Include examples of correct format.',
    userImpact: 'Users spend more time trying to correct errors and may abandon forms due to frustration.',
    disabilityType: ['Cognitive']
  },
  {
    id: '3.3.4',
    name: 'Error Prevention (Legal, Financial, Data)',
    description: 'For Web pages that cause legal commitments or financial transactions for the user to occur.',
    level: 'AA',
    version: '2.0',
    category: 'Understandable',
    severity: 'High',
    defectSummary: 'Critical actions (purchases, submissions) lack confirmation mechanisms, risking accidental commitments.',
    recommendation: 'Provide confirmation steps for critical actions. Allow users to review and confirm before finalizing.',
    userImpact: 'Users may accidentally commit to legal or financial obligations without intending to do so.',
    disabilityType: ['Motor', 'Cognitive']
  },

  // Understandable - WCAG 2.1
  {
    id: '3.3.7',
    name: 'Authentication',
    description: 'A mechanism is available for the user to identify input errors.',
    level: 'AA',
    version: '2.1',
    category: 'Understandable',
    severity: 'Medium',
    defectSummary: 'Authentication processes lack error identification mechanisms, making it difficult to understand login failures.',
    recommendation: 'Provide clear error messages for authentication failures. Allow users to identify and correct input errors.',
    userImpact: 'Users cannot understand why authentication failed or how to correct the problem.',
    disabilityType: ['Cognitive']
  },
  {
    id: '3.3.8',
    name: 'Redundant Entry',
    description: 'Information previously entered by or provided to the user that is required to be entered again in the same process is either auto-populated or available for the user to select.',
    level: 'AA',
    version: '2.1',
    category: 'Understandable',
    severity: 'Medium',
    defectSummary: 'Users must re-enter information that was previously provided, creating unnecessary burden and potential for errors.',
    recommendation: 'Auto-populate fields with previously entered information. Provide selection options for repeated data entry.',
    userImpact: 'Users with motor disabilities or cognitive impairments may struggle with repeated data entry.',
    disabilityType: ['Motor', 'Cognitive']
  },

  // Robust - WCAG 2.0
  {
    id: '4.1.1',
    name: 'Parsing',
    description: 'In content implemented using markup languages, elements have complete start and end tags.',
    level: 'A',
    version: '2.0',
    category: 'Robust',
    severity: 'High',
    defectSummary: 'HTML markup contains parsing errors (missing tags, duplicate attributes), preventing assistive technologies from working properly.',
    recommendation: 'Ensure valid HTML markup. Use HTML validators to check for parsing errors. Fix all syntax issues.',
    userImpact: 'Assistive technologies may not function correctly or may provide incorrect information to users.',
    disabilityType: ['Vision', 'Motor']
  },
  {
    id: '4.1.2',
    name: 'Name, Role, Value',
    description: 'For all user interface components, the name and role can be programmatically determined.',
    level: 'A',
    version: '2.0',
    category: 'Robust',
    severity: 'Critical',
    defectSummary: 'UI components lack proper accessibility attributes, making them unusable with assistive technologies.',
    recommendation: 'Provide proper ARIA roles, labels, and values for all interactive components. Use semantic HTML elements.',
    userImpact: 'Users with assistive technologies cannot interact with or understand UI components.',
    disabilityType: ['Vision', 'Motor']
  },

  // Robust - WCAG 2.1
  {
    id: '4.1.3',
    name: 'Status Messages',
    description: 'In content implemented using markup languages, status messages can be programmatically determined through role or properties.',
    level: 'AA',
    version: '2.1',
    category: 'Robust',
    severity: 'Medium',
    defectSummary: 'Status messages (alerts, notifications) are not announced to assistive technologies, making users miss important information.',
    recommendation: 'Use appropriate ARIA roles (alert, status, log) for status messages. Ensure messages are announced to screen readers.',
    userImpact: 'Users with screen readers miss important status updates, notifications, and feedback.',
    disabilityType: ['Vision']
  }
];

export const getWCAGCriteriaByVersionAndLevel = (auditType: string, auditLevel: string): WCAGCriteria[] => {
  let version: string;
  switch (auditType) {
    case 'WCAG_2_0': version = '2.0'; break;
    case 'WCAG_2_1': version = '2.1'; break;
    case 'WCAG_2_2': version = '2.2'; break;
    default: version = '2.1';
  }

  return WCAG_CRITERIA.filter(criteria => {
    if (version === '2.2') {
      // WCAG 2.2 includes 2.0, 2.1, and 2.2 criteria
      return (criteria.version === '2.0' || criteria.version === '2.1') && 
             (auditLevel === 'A' || (auditLevel === 'AA' && (criteria.level === 'A' || criteria.level === 'AA')));
    }
    if (version === '2.1') {
      // WCAG 2.1 includes both 2.0 and 2.1 criteria
      return (criteria.version === '2.0' || criteria.version === '2.1') && 
             (auditLevel === 'A' || (auditLevel === 'AA' && (criteria.level === 'A' || criteria.level === 'AA')));
    }
    if (version === '2.0') {
      // WCAG 2.0 only includes 2.0 criteria
      return criteria.version === '2.0' && 
             (auditLevel === 'A' || (auditLevel === 'AA' && (criteria.level === 'A' || criteria.level === 'AA')));
    }
    return false;
  });
};

export const getWCAGCriteriaOptions = (auditType: string, auditLevel: string) => {
  const criteria = getWCAGCriteriaByVersionAndLevel(auditType, auditLevel);
  return criteria.map(c => ({
    value: c.id,
    label: `${c.id} - ${c.name} (${c.level})`
  }));
};

export const getWCAGCriteriaById = (criteriaId: string): WCAGCriteria | undefined => {
  return WCAG_CRITERIA.find(criteria => criteria.id === criteriaId);
}; 