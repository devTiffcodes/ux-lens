export interface Guideline {
  id: string;
  title: string;
  category: 'Usability' | 'Accessibility' | 'Cognitive Wellbeing' | 'Visual Design';
  source: string;
  summary: string;
  explanation: string;
  whyItMatters: string;
  whatToLookFor: string[];
  uxLensApplication: string;
  screenshot: string;
  screenshotAlt: string;
  relatedGuidelines: string[];
}

export const GUIDELINES: Guideline[] = [
  {
    id: 'visibility-system-status',
    title: 'Visibility of System Status',
    category: 'Usability',
    source: "Nielsen's 10 Usability Heuristics",
    summary:
      'Keep users informed about what is happening through appropriate and timely feedback.',
    explanation:
      'Users should be able to understand what the system is doing after they perform an action. Important changes in state should be visible rather than leaving users wondering whether the system has responded.',
    whyItMatters:
      'When feedback is missing or unclear, users may become confused, repeat actions, or lose confidence in the interface.',
    whatToLookFor: [
      'Actions provide clear feedback.',
      'Loading states are visible when information is being processed.',
      'Users can tell when an operation has completed.',
      'Errors and changes in state are communicated clearly.'
    ],
    uxLensApplication:
      'UX Lens communicates important system states through loading indicators, survey progress, analysis results, and feedback messages. These elements help users understand what is happening without having to guess.',
    screenshot: 'assets/guidelines/visibility-system-status.png',
    screenshotAlt: 'UX Lens interface demonstrating visibility of system status',
    relatedGuidelines: ['error-prevention-recovery', 'clear-information-hierarchy']
  },
  {
    id: 'consistency-standards',
    title: 'Consistency and Standards',
    category: 'Usability',
    source: "Nielsen's 10 Usability Heuristics",
    summary:
      'Use consistent terminology, layouts, controls, and visual patterns throughout the interface.',
    explanation:
      'Users should not have to learn different ways of performing similar actions. Consistent patterns allow users to transfer knowledge from one part of the application to another.',
    whyItMatters:
      'Consistency reduces the amount users need to learn and makes an interface easier to understand and navigate.',
    whatToLookFor: [
      'Buttons behave consistently.',
      'Similar elements use similar visual styles.',
      'Navigation remains predictable.',
      'Terminology is consistent throughout the application.'
    ],
    uxLensApplication:
      'UX Lens uses consistent navigation, buttons, cards, typography, spacing, colours, and interaction patterns across the Dashboard, Survey, Site Analyzer, and Dev Panel.',
    screenshot: 'assets/guidelines/consistency-standards.png',
    screenshotAlt: 'UX Lens interface demonstrating consistent visual and interaction patterns',
    relatedGuidelines: ['clear-information-hierarchy', 'recognition-rather-than-recall']
  },
  {
    id: 'recognition-rather-than-recall',
    title: 'Recognition Rather Than Recall',
    category: 'Usability',
    source: "Nielsen's 10 Usability Heuristics",
    summary:
      'Make important information, options, and actions visible so users do not have to rely on memory.',
    explanation:
      'Interfaces should expose relevant information at the moment users need it instead of forcing them to remember information from another screen or previous interaction.',
    whyItMatters:
      'Reducing memory demands makes interactions easier and can reduce unnecessary cognitive effort.',
    whatToLookFor: [
      'Important options are visible.',
      'Labels clearly describe controls.',
      'Relevant information is shown near the action that uses it.',
      'Users do not need to remember information unnecessarily.'
    ],
    uxLensApplication:
      'UX Lens keeps important labels, scores, recommendations, navigation options, and survey information visible so researchers can understand the interface without relying on memory.',
    screenshot: 'assets/guidelines/recognition-rather-than-recall.png',
    screenshotAlt: 'UX Lens interface demonstrating recognition rather than recall',
    relatedGuidelines: ['clear-information-hierarchy', 'reduce-cognitive-load']
  },
  {
    id: 'error-prevention-recovery',
    title: 'Error Prevention and Recovery',
    category: 'Usability',
    source: "Nielsen's 10 Usability Heuristics",
    summary:
      'Prevent avoidable errors and help users understand and recover from errors when they occur.',
    explanation:
      'Good interfaces do not simply report that something went wrong. They help prevent predictable mistakes and provide understandable feedback when an error occurs.',
    whyItMatters:
      'Clear error prevention and recovery reduces frustration and helps users continue their task instead of becoming stuck.',
    whatToLookFor: [
      'Required information is clearly identified.',
      'Invalid input is explained.',
      'Error messages use understandable language.',
      'Users receive guidance about how to recover.'
    ],
    uxLensApplication:
      'UX Lens validates important inputs and communicates problems during interactions such as authentication, survey completion, and website analysis.',
    screenshot: 'assets/guidelines/error-prevention-recovery.png',
    screenshotAlt: 'UX Lens interface demonstrating error prevention and recovery',
    relatedGuidelines: ['visibility-system-status', 'clear-information-hierarchy']
  },
  {
    id: 'user-control',
    title: 'Provide User Control',
    category: 'Usability',
    source: "Nielsen's 10 Usability Heuristics",
    summary:
      'Give users appropriate control over their actions, navigation, and interactions.',
    explanation:
      'Users should feel that they are controlling the interface rather than being forced through unexpected actions or processes.',
    whyItMatters:
      'A sense of control supports confidence and allows users to correct mistakes or change direction when needed.',
    whatToLookFor: [
      'Users can navigate back when appropriate.',
      'Actions are predictable.',
      'Users can change their choices before completing a task.',
      'Unexpected actions are avoided.'
    ],
    uxLensApplication:
      'UX Lens provides navigation between major features and allows users to move through survey and analysis workflows without unnecessary restrictions.',
    screenshot: 'assets/guidelines/user-control.png',
    screenshotAlt: 'UX Lens interface demonstrating user control',
    relatedGuidelines: ['error-prevention-recovery', 'consistency-standards']
  },
  {
    id: 'sufficient-color-contrast',
    title: 'Sufficient Color Contrast',
    category: 'Accessibility',
    source: 'WCAG 2.1, Success Criterion 1.4.3',
    summary:
      'Ensure text and important visual information can be distinguished clearly from its background.',
    explanation:
      'Text should have enough contrast with its background to remain readable. Contrast is particularly important for users with visual impairments and in situations where lighting conditions make interfaces harder to read.',
    whyItMatters:
      'Poor contrast can make information difficult or impossible to read, reducing accessibility and usability.',
    whatToLookFor: [
      'Body text is clearly distinguishable from its background.',
      'Important interface elements are visually distinguishable.',
      'Muted text remains readable.',
      'Colour is not the only way important information is communicated.'
    ],
    uxLensApplication:
      'UX Lens uses deliberate text, background, card, and accent colour combinations to maintain readable content while keeping the interface visually calm.',
    screenshot: 'assets/guidelines/sufficient-color-contrast.png',
    screenshotAlt: 'UX Lens interface demonstrating sufficient colour contrast',
    relatedGuidelines: ['readable-typography', 'clear-information-hierarchy']
  },
  {
    id: 'readable-typography',
    title: 'Readable Typography',
    category: 'Accessibility',
    source: 'Accessibility and usability best practices',
    summary:
      'Use typography that supports comfortable reading and clear information processing.',
    explanation:
      'Typography affects how easily users can scan, read, and understand information. Font size, spacing, line length, hierarchy, and weight should work together rather than competing for attention.',
    whyItMatters:
      'Poor typography increases reading effort and can make information feel more difficult to process.',
    whatToLookFor: [
      'Body text is large enough to read comfortably.',
      'Headings clearly establish hierarchy.',
      'Line spacing supports comfortable reading.',
      'Text is not unnecessarily dense.'
    ],
    uxLensApplication:
      'UX Lens uses distinct heading and body-text styles, spacing, and readable content blocks to make dashboards, recommendations, and guidelines easier to scan.',
    screenshot: 'assets/guidelines/readable-typography.png',
    screenshotAlt: 'UX Lens interface demonstrating readable typography',
    relatedGuidelines: ['sufficient-color-contrast', 'clear-information-hierarchy']
  },
  {
    id: 'clear-information-hierarchy',
    title: 'Clear Information Hierarchy',
    category: 'Visual Design',
    source: 'UX and visual design principles',
    summary:
      'Organise information so users can quickly understand what is most important.',
    explanation:
      'A clear visual hierarchy uses size, spacing, grouping, positioning, and emphasis to communicate relationships between pieces of information.',
    whyItMatters:
      'Users often scan interfaces before reading them in detail. A clear hierarchy helps them identify important information quickly.',
    whatToLookFor: [
      'Primary information is visually prominent.',
      'Related information is grouped together.',
      'Headings describe the content that follows.',
      'Spacing separates different sections clearly.'
    ],
    uxLensApplication:
      'The UX Lens Dashboard, Site Analyzer, and Guidelines pages use headings, cards, sections, and spacing to organise complex information into understandable groups.',
    screenshot: 'assets/guidelines/clear-information-hierarchy.png',
    screenshotAlt: 'UX Lens interface demonstrating clear information hierarchy',
    relatedGuidelines: ['reduce-cognitive-load', 'consistency-standards']
  },
  {
    id: 'minimalist-design',
    title: 'Aesthetic and Minimalist Design',
    category: 'Visual Design',
    source: "Nielsen's 10 Usability Heuristics",
    summary:
      'Keep interfaces focused by avoiding information that is irrelevant or rarely needed.',
    explanation:
      'Every additional visual element competes for attention. A minimalist interface does not mean an empty interface; it means that the information presented is purposeful and appropriately organised.',
    whyItMatters:
      'Reducing unnecessary interface elements can make important information easier to notice and understand.',
    whatToLookFor: [
      'Every major element serves a clear purpose.',
      'Whitespace separates information appropriately.',
      'Visual decoration does not interfere with functionality.',
      'Important content remains easy to identify.'
    ],
    uxLensApplication:
      'UX Lens uses structured cards, whitespace, focused sections, and restrained visual styling to keep attention on research and analysis tasks.',
    screenshot: 'assets/guidelines/minimalist-design.png',
    screenshotAlt: 'UX Lens interface demonstrating minimalist design',
    relatedGuidelines: ['avoid-unnecessary-distractions', 'clear-information-hierarchy']
  },
  {
    id: 'reduce-cognitive-load',
    title: 'Reduce Cognitive Load',
    category: 'Cognitive Wellbeing',
    source: 'UX and cognitive design principles',
    summary:
      'Reduce unnecessary mental effort by presenting information in clear and manageable ways.',
    explanation:
      'Cognitive load refers to the mental effort required to understand and interact with an interface. Interfaces should avoid unnecessary complexity and help users focus on the task they are trying to complete.',
    whyItMatters:
      'Excessive cognitive demands can contribute to confusion, fatigue, frustration, and reduced task performance.',
    whatToLookFor: [
      'Information is presented in manageable sections.',
      'Unnecessary choices are avoided.',
      'Complex tasks are broken into understandable steps.',
      'The interface does not overwhelm users with competing information.'
    ],
    uxLensApplication:
      'Reducing cognitive load is central to UX Lens because the application evaluates UX in relation to digital wellbeing. Dashboards, surveys, and analysis results are structured into focused sections rather than presenting all information at once.',
    screenshot: 'assets/guidelines/reduce-cognitive-load.png',
    screenshotAlt: 'UX Lens interface demonstrating reduced cognitive load',
    relatedGuidelines: ['avoid-unnecessary-distractions', 'clear-information-hierarchy']
  },
  {
    id: 'avoid-unnecessary-distractions',
    title: 'Avoid Unnecessary Distractions',
    category: 'Cognitive Wellbeing',
    source: 'UX and digital wellbeing principles',
    summary:
      'Remove visual and interactive elements that do not support the user\'s current task.',
    explanation:
      'Not every available feature needs to compete for the user\'s attention. Interfaces should prioritise relevant information and avoid unnecessary movement, decoration, notifications, or competing calls to action.',
    whyItMatters:
      'Unnecessary distractions can interrupt attention and make interfaces feel more mentally demanding.',
    whatToLookFor: [
      'The primary task remains visually clear.',
      'Decorative elements do not overpower useful information.',
      'Competing calls to action are limited.',
      'Animations and notifications have a clear purpose.'
    ],
    uxLensApplication:
      'UX Lens uses a focused interface structure so researchers can concentrate on analysis, survey responses, results, and recommendations without unnecessary visual interruptions.',
    screenshot: 'assets/guidelines/avoid-unnecessary-distractions.png',
    screenshotAlt: 'UX Lens interface demonstrating reduced visual distractions',
    relatedGuidelines: ['reduce-cognitive-load', 'clear-information-hierarchy']
  },
  {
    id: 'clear-communication',
    title: 'Use Clear Communication',
    category: 'Cognitive Wellbeing',
    source: 'UX and communication principles',
    summary:
      'Present information in language that users can understand quickly and confidently.',
    explanation:
      'Interface text should communicate the purpose of actions, the meaning of information, and the results of user interactions without unnecessary technical or ambiguous language.',
    whyItMatters:
      'Clear communication reduces uncertainty and makes interfaces easier to understand, especially when presenting complex information.',
    whatToLookFor: [
      'Buttons clearly describe their action.',
      'Instructions are concise.',
      'Feedback messages are understandable.',
      'Technical information is explained when necessary.'
    ],
    uxLensApplication:
      'UX Lens translates analysis information into readable summaries, recommendations, survey questions, and AI-generated feedback so researchers can understand the results more easily.',
    screenshot: 'assets/guidelines/clear-communication.png',
    screenshotAlt: 'UX Lens interface demonstrating clear communication',
    relatedGuidelines: ['recognition-rather-than-recall', 'reduce-cognitive-load']
  }
];
