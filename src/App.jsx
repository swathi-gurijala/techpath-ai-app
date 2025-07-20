import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';

// IMPORTANT: Using environment variables for Firebase config
// These values are loaded from your Vercel project's environment variables
// For local development, you would put these in a .env file in your project root
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional, for Google Analytics
};

// The appId should now come from the environment variable
const appId = firebaseConfig.appId;

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Define predefined data for demonstration purposes
const predefinedJobRoles = [
  { id: 'se', name: 'Software Engineer', requiredSkills: ['Python', 'Java', 'Data Structures', 'Algorithms', 'Web Development', 'Cloud Computing (AWS/Azure/GCP)', 'Databases'] },
  { id: 'da', name: 'Data Analyst', requiredSkills: ['Python', 'SQL', 'Statistics', 'Excel', 'Data Visualization', 'Business Intelligence'] },
  { id: 'ml', name: 'ML Engineer', requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'Calculus', 'Linear Algebra', 'TensorFlow/PyTorch', 'Model Deployment'] },
  { id: 'devops', name: 'DevOps Engineer', requiredSkills: ['Linux', 'Cloud Computing (AWS/Azure/GCP)', 'Docker', 'Kubernetes', 'CI/CD', 'Scripting (Bash/Python)', 'Networking'] },
  { id: 'cyber', name: 'Cybersecurity Analyst', requiredSkills: ['Networking', 'Security Principles', 'Linux', 'Python', 'Cryptography', 'Incident Response', 'Vulnerability Assessment'] },
  { id: 'iot', name: 'IoT Developer', requiredSkills: ['Embedded Systems', 'C++', 'Python', 'Networking', 'Cloud Platforms', 'Sensor Integration', 'Hardware Programming'] },
  { id: 'arvr', name: 'AR/VR Developer', requiredSkills: ['Unity', 'C#', '3D Modeling', 'Game Development', 'Graphics Programming', 'Spatial Computing', 'XR Development'] },
  { id: 'de', name: 'Data Engineer', requiredSkills: ['Python', 'SQL', 'Databases', 'ETL', 'Big Data (Spark/Hadoop)', 'Cloud Computing (AWS/Azure/GCP)'] },
  // Add more roles as needed
];

const predefinedProjects = [
  { id: 'p1', name: 'E-commerce Website (Full Stack)', skills: ['Web Development', 'Python', 'Java', 'Databases'], category: 'Software Engineering', description: 'Develop a complete e-commerce platform with user authentication, product listings, shopping cart, and payment integration.' },
  { id: 'p2', name: 'Predictive Sales Model', skills: ['Python', 'Machine Learning', 'Data Visualization', 'SQL'], category: 'Data Science', description: 'Build a model to forecast sales based on historical data, marketing spend, and economic indicators.' },
  { id: 'p3', name: 'Image Classifier for Medical Diagnosis', skills: ['Python', 'Deep Learning', 'Computer Vision'], category: 'AI/ML', description: 'Create a CNN model to classify medical images (e.g., X-rays for pneumonia detection).' },
  { id: 'p4', name: 'Automated Deployment Pipeline', skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud Computing'], category: 'DevOps', description: 'Set up an automated CI/CD pipeline for a web application using Jenkins/GitLab CI and deploy to a cloud platform.' },
  { id: 'p5', name: 'Smart Home Automation System', skills: ['Embedded Systems', 'C++', 'Python', 'IoT', 'Networking'], category: 'IoT', description: 'Develop a system to control smart home devices (lights, thermostat) using a Raspberry Pi and cloud connectivity.' },
  { id: 'p6', name: 'AR Navigation App', skills: ['Unity', 'C#', 'AR/VR', '3D Modeling'], category: 'AR/VR', description: 'Design and implement an augmented reality application for indoor navigation using Unity and ARCore/ARKit.' },
  { id: 'p7', name: 'Network Intrusion Detection System', skills: ['Python', 'Networking', 'Cybersecurity'], category: 'Cybersecurity', description: 'Build a system to detect malicious network activities using packet analysis and machine learning.' },
  { id: 'p8', name: 'Sentiment Analysis for Social Media', skills: ['Python', 'Natural Language Processing', 'Machine Learning'], category: 'AI/ML', description: 'Analyze social media posts to determine public sentiment towards a brand or topic.' },
  { id: 'p9', name: 'Data Pipeline for Real-time Analytics', skills: ['Python', 'SQL', 'Big Data (Spark/Kafka)', 'Cloud Computing'], category: 'Data Engineering', description: 'Design and implement a robust data pipeline for real-time data ingestion and processing.' },
  // Add more projects
];

const predefinedHackathons = [
  { id: 'h1', name: 'InnovateX Hackathon', focus: ['Web Development', 'AI/ML'], date: 'Oct 2025', description: 'A general hackathon focusing on innovative solutions across various tech domains.' },
  { id: 'h2', name: 'Data Science Challenge', focus: ['Data Science', 'Machine Learning'], date: 'Nov 2025', description: 'Solve real-world data problems using advanced analytics and machine learning techniques.' },
  { id: 'h3', name: 'CyberSec Marathon', focus: ['Cybersecurity', 'Networking'], date: 'Dec 2025', description: 'Focus on network security, ethical hacking, and incident response challenges.' },
  { id: 'h4', name: 'IoT Solutions Fest', focus: ['IoT', 'Embedded Systems'], date: 'Jan 2026', description: 'Develop smart solutions for connected devices and smart environments.' },
  // Add more hackathons
];

const predefinedInternships = [
  { id: 'i1', name: 'Software Dev Intern @ TechCorp', skills: ['Python', 'Java', 'Web Development'], branch: ['Computer Science', 'IT'], description: 'Work on backend services for a leading tech company.' },
  { id: 'i2', name: 'Data Science Intern @ AnalyticsCo', skills: ['Python', 'SQL', 'Machine Learning'], branch: ['Data Science', 'AIML'], description: 'Assist in building predictive models and analyzing large datasets.' },
  { id: 'i3', name: 'Cybersecurity Intern @ SecureNet', skills: ['Networking', 'Linux', 'Security Principles'], branch: ['Cybersecurity', 'IT'], description: 'Participate in vulnerability assessments and security audits.' },
  // Add more internships
];

const predefinedBranches = ['Computer Science', 'Information Technology', 'Cybersecurity', 'AIML', 'Data Science', 'IoT', 'AR/VR', 'ECE'];
const predefinedSkills = [
  'Python', 'Java', 'C++', 'JavaScript', 'SQL', 'Data Structures', 'Algorithms', 'Web Development', 'Databases',
  'Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing', 'Statistics', 'Calculus', 'Linear Algebra',
  'Cloud Computing (AWS/Azure/GCP)', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Networking',
  'Security Principles', 'Embedded Systems', 'Unity', 'C#', '3D Modeling', 'Game Development',
  'Data Visualization', 'Excel', 'Cryptography', 'AR/VR', 'Graphics Programming', 'Business Intelligence',
  'TensorFlow/PyTorch', 'Model Deployment', 'Scripting (Bash)', 'Incident Response', 'Vulnerability Assessment',
  'Sensor Integration', 'Hardware Programming', 'Spatial Computing', 'XR Development', 'ETL', 'Big Data (Spark/Hadoop)'
];

function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState({
    branch: '',
    programmingSkills: [],
    targetRoles: [],
    targetCompanies: [], // New field for target companies
    projectsCompleted: [],
    githubProfile: '',
    leetcodeProfile: '',
    codechefProfile: '',
    linkedinProfile: '',
    vercelProfile: '',
    netlifyProfile: '',
    resumeURL: '', // For resume upload
    academicSchedule: [], // e.g., [{ id: 'uuid1', subject: 'DSA', examDate: '2025-12-15' }]
    skillImprovementPlan: [], // e.g., [{ id: 'uuid2', skill: 'Deep Learning', resource: 'Coursera CNN course', status: 'In Progress' }]
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'profile', 'skills', 'projects', 'opportunities', 'interview'

  // State for new academic schedule input
  const [newSubject, setNewSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  // State for new skill improvement plan input
  const [newSkillToImprove, setNewSkillToImprove] = useState('');
  const [newSkillResource, setNewSkillResource] = useState('');
  const [newSkillStatus, setNewSkillStatus] = useState('Not Started');

  // State for new target company input
  const [newTargetCompany, setNewTargetCompany] = useState('');

  // State for interview practice
  const [interviewQuestion, setInterviewQuestion] = useState('Tell me about yourself.');
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [analyzingAnswer, setAnalyzingAnswer] = useState(false);

  // State for AI-Powered Daily Study Plan
  const [dailyPlanGenerated, setDailyPlanGenerated] = useState(false);
  const [generatedDailyPlan, setGeneratedDailyPlan] = useState([]);

  // State for Resume Analysis
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeAnalysisReport, setResumeAnalysisReport] = useState(null);

  // State for custom dropdown
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const branchDropdownRef = useRef(null); // Ref for clicking outside to close


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // Fetch student profile if exists
        const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/studentProfiles`, 'myProfile');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudentProfile(data);
          if (data.resumeURL) {
            setResumeUploaded(true);
            setResumeAnalysisReport({ /* mock data */ });
          }
        }
        setLoading(false);
      } else {
        // Sign in anonymously if no user is authenticated
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Error signing in:", error);
          setModalMessage(`Error signing in: ${error.message}`);
          setShowModal(true);
          setLoading(false);
        }
      }
    });

    // Handle clicks outside the custom dropdown to close it
    const handleClickOutside = (event) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setStudentProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (skill) => {
    setStudentProfile(prev => {
      const currentSkills = prev.programmingSkills;
      if (currentSkills.includes(skill)) {
        return { ...prev, programmingSkills: currentSkills.filter(s => s !== skill) };
      } else {
        return { ...prev, programmingSkills: [...currentSkills, skill] };
      }
    });
  };

  const handleTargetRoleChange = (roleId) => {
    setStudentProfile(prev => {
      const currentRoles = prev.targetRoles;
      if (currentRoles.includes(roleId)) {
        return { ...prev, targetRoles: currentRoles.filter(r => r !== roleId) };
      } else {
        return { ...prev, targetRoles: [...currentRoles, roleId] };
      }
    });
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real application, you would upload this file to cloud storage (e.g., Firebase Storage)
      // and save the URL. For this demo, we'll just save a placeholder URL.
      const mockURL = `https://example.com/resumes/${userId}/${file.name}`;
      setStudentProfile(prev => ({ ...prev, resumeURL: mockURL }));
      setResumeUploaded(true);
      // Mock AI analysis report generation
      setResumeAnalysisReport({
        skillsIdentified: ['Python', 'Java', 'Web Development', 'SQL', 'Problem Solving'],
        suggestedImprovements: ['Add more quantifiable achievements to project descriptions.', 'Tailor summary to specific job roles.', 'Expand on internship responsibilities.'],
        keywordOptimization: ['Data Structures', 'Algorithms', 'Cloud Computing', 'Machine Learning']
      });
      setModalMessage("Resume uploaded (mock URL saved) and AI analysis initiated!");
      setShowModal(true);
    }
  };

  const saveProfile = async () => {
    if (!userId) {
      setModalMessage("User not authenticated. Please try again.");
      setShowModal(true);
      return;
    }
    try {
      const docRef = doc(db, `artifacts/${appId}/users/${userId}/studentProfiles`, 'myProfile');
      await setDoc(docRef, studentProfile, { merge: true });
      setModalMessage("Profile saved successfully!");
      setShowModal(true);
    } catch (e) {
      console.error("Error saving profile:", e);
      setModalMessage(`Error saving profile: ${e.message}`);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // Academic Schedule Handlers
  const addAcademicSubject = () => {
    if (newSubject && newExamDate) {
      setStudentProfile(prev => ({
        ...prev,
        academicSchedule: [...prev.academicSchedule, { id: crypto.randomUUID(), subject: newSubject, examDate: newExamDate }]
      }));
      setNewSubject('');
      setNewExamDate('');
      saveProfile(); // Save immediately
    } else {
      setModalMessage("Please enter both subject and exam date.");
      setShowModal(true);
    }
  };

  const removeAcademicSubject = (id) => {
    setStudentProfile(prev => ({
      ...prev,
      academicSchedule: prev.academicSchedule.filter(item => item.id !== id)
    }));
    saveProfile(); // Save immediately
  };

  // Skill Improvement Plan Handlers
  const addSkillImprovement = () => {
    if (newSkillToImprove && newSkillResource) {
      setStudentProfile(prev => ({
        ...prev,
        skillImprovementPlan: [...prev.skillImprovementPlan, { id: crypto.randomUUID(), skill: newSkillToImprove, resource: newSkillResource, status: newSkillStatus }]
      }));
      setNewSkillToImprove('');
      setNewSkillResource('');
      setNewSkillStatus('Not Started');
      saveProfile(); // Save immediately
    } else {
      setModalMessage("Please enter skill and resource for improvement plan.");
      setShowModal(true);
    }
  };

  const updateSkillImprovementStatus = (id, newStatus) => {
    setStudentProfile(prev => ({
      ...prev,
      skillImprovementPlan: prev.skillImprovementPlan.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    }));
    saveProfile(); // Save immediately
  };

  const removeSkillImprovement = (id) => {
    setStudentProfile(prev => ({
      ...prev,
      skillImprovementPlan: prev.skillImprovementPlan.filter(item => item.id !== id)
    }));
    saveProfile(); // Save immediately
  };

  // Target Company Handlers
  const addTargetCompany = () => {
    if (newTargetCompany && !studentProfile.targetCompanies.includes(newTargetCompany)) {
      setStudentProfile(prev => ({
        ...prev,
        targetCompanies: [...prev.targetCompanies, newTargetCompany]
      }));
      setNewTargetCompany('');
      saveProfile(); // Save immediately
    } else if (studentProfile.targetCompanies.includes(newTargetCompany)) {
      setModalMessage("Company already added.");
      setShowModal(true);
    } else {
      setModalMessage("Please enter a company name.");
      setShowModal(true);
    }
  };

  const removeTargetCompany = (companyName) => {
    setStudentProfile(prev => ({
      ...prev,
      targetCompanies: prev.targetCompanies.filter(company => company !== companyName)
    }));
    saveProfile(); // Save immediately
  };

  // Interview Practice Handlers
  const generateInterviewQuestion = async () => {
    setGeneratingQuestion(true);
    setAiFeedback('');
    setInterviewAnswer('');
    // Mock AI question generation based on target roles/skills
    const roles = studentProfile.targetRoles.map(id => predefinedJobRoles.find(r => r.id === id)?.name).filter(Boolean);
    const skills = studentProfile.programmingSkills.slice(0, 3).join(', '); // Use top 3 skills
    let prompt = `Generate a common interview question for a B.Tech student interested in roles like ${roles.join(', ')}. Focus on skills such as ${skills}.`;

    // In a real app, you'd call Gemini API here:
    // const response = await fetch(apiUrl, { method: 'POST', body: JSON.stringify({ prompt: prompt }) });
    // const result = await response.json();
    // setInterviewQuestion(result.candidates[0].content.parts[0].text);

    // Mock response for now
    const mockQuestions = [
      `Describe a challenging project you've worked on and how you overcame obstacles, relevant to a ${roles[0] || 'tech'} role.`,
      `Explain a core concept in ${skills.split(',')[0] || 'your primary skill'} as if explaining it to a non-technical person.`,
      `How do you handle constructive criticism on your code/work in a team environment?`,
      `Given your interest in ${roles[0] || 'Software Engineering'}, what is your understanding of Data Structures and Algorithms and their importance?`,
      `What are your career aspirations in the next 3-5 years, especially considering your interest in ${roles[0] || 'AI/ML'}?`
    ];
    setInterviewQuestion(mockQuestions[Math.floor(Math.random() * mockQuestions.length)]);
    setGeneratingQuestion(false);
  };

  const analyzeInterviewAnswer = async () => {
    if (!interviewAnswer.trim()) {
      setModalMessage("Please provide an answer to analyze.");
      setShowModal(true);
      return;
    }
    setAnalyzingAnswer(true);
    setAiFeedback('');

    // Mock AI feedback generation
    const feedbackMessages = [
      "Good start! Try to be more specific with examples.",
      "Your answer is clear and concise. Consider adding a personal touch.",
      "Excellent explanation! You demonstrated strong understanding.",
      "Focus on structuring your answer using the STAR method (Situation, Task, Action, Result).",
      "You covered the technical aspects well. Practice articulating the business impact.",
      "Ensure your answer directly addresses the question asked.",
    ];
    setAiFeedback(feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]);
    setAnalyzingAnswer(false);
  };

  // AI-Powered Recommendation Logic (Simplified for demonstration)
  const getRecommendedProjects = () => {
    const recommended = new Set();
    studentProfile.targetRoles.forEach(roleId => {
      const targetRole = predefinedJobRoles.find(role => role.id === roleId);
      if (targetRole) {
        predefinedProjects.forEach(project => {
          // Check if project skills align with target role required skills
          const skillOverlap = project.skills.filter(skill => targetRole.requiredSkills.includes(skill)).length;
          // Also consider if the student has some of the project skills
          const studentSkillOverlap = project.skills.filter(skill => studentProfile.programmingSkills.includes(skill)).length;

          // Recommend if there's good overlap with target role skills AND student has some foundational skills
          if (skillOverlap >= 2 && studentSkillOverlap >= 1) {
            recommended.add(project);
          }
        });
      }
    });
    return Array.from(recommended);
  };

  // AI-Driven Project Idea Generation (Mock)
  const generateNewProjectIdea = async () => {
    setModalMessage("Generating a new project idea based on your profile...");
    setShowModal(true);
    // In a real app, you'd call Gemini API with a prompt like:
    // `Generate a unique, impressive project idea for a B.Tech student with skills: ${studentProfile.programmingSkills.join(', ')} and target roles: ${studentProfile.targetRoles.map(id => predefinedJobRoles.find(r => r.id === id)?.name).filter(Boolean).join(', ')}. The idea should be beginner-friendly but impactful.`
    
    const mockIdeas = [
      "AI-Powered Resume Keyword Optimizer: A web app that takes a resume and a job description, and suggests keywords from the job description to include in the resume to improve ATS compatibility.",
      "Smart Waste Segregation System: An IoT-based project using computer vision to automatically sort waste into different categories (e.g., plastic, paper, organic).",
      "Personalized Learning Path Generator: A tool that takes a desired skill/role and current knowledge, then generates a step-by-step learning path with recommended resources (online courses, books, tutorials).",
      "Voice-Controlled Smart Mirror: An AR/IoT project where a mirror displays information (weather, news) and responds to voice commands, with customizable widgets.",
      "Decentralized Voting System using Blockchain: A project exploring blockchain fundamentals for a secure and transparent voting application.",
    ];
    const generatedIdea = mockIdeas[Math.floor(Math.random() * mockIdeas.length)];
    setModalMessage(`New AI-Generated Project Idea: "${generatedIdea}"`);
    setShowModal(true);
  };


  const getRecommendedHackathons = () => {
    const recommended = new Set();
    studentProfile.targetRoles.forEach(roleId => {
      const targetRole = predefinedJobRoles.find(role => role.id === roleId);
      if (targetRole) {
        predefinedHackathons.forEach(hackathon => {
          // Check if hackathon focus areas overlap with target role required skills
          const focusOverlap = hackathon.focus.filter(f => targetRole.requiredSkills.some(rs => rs.includes(f) || f.includes(rs))).length;
          // Also consider if the student has some of the hackathon focus skills
          const studentFocusOverlap = hackathon.focus.filter(f => studentProfile.programmingSkills.includes(f)).length;

          if (focusOverlap > 0 && studentFocusOverlap > 0) {
            recommended.add(hackathon);
          }
        });
      }
    });
    return Array.from(recommended);
  };

  const getRecommendedInternships = () => {
    const recommended = new Set();
    studentProfile.targetRoles.forEach(roleId => {
      const targetRole = predefinedJobRoles.find(role => role.id === roleId);
      if (targetRole) {
        predefinedInternships.forEach(internship => {
          // Check if internship skills overlap with target role required skills
          const skillOverlap = internship.skills.filter(skill => targetRole.requiredSkills.includes(skill)).length;
          const branchMatch = internship.branch.includes(studentProfile.branch);
          // Recommend if there's good skill overlap AND branch matches
          if (skillOverlap >= 2 && branchMatch) {
            recommended.add(internship);
          }
        });
      }
    });
    return Array.from(recommended);
  };

  const getSkillGaps = () => {
    const gaps = new Set();
    studentProfile.targetRoles.forEach(roleId => {
      const targetRole = predefinedJobRoles.find(role => role.id === roleId);
      if (targetRole) {
        targetRole.requiredSkills.forEach(requiredSkill => {
          if (!studentProfile.programmingSkills.includes(requiredSkill)) {
            gaps.add(requiredSkill);
          }
        });
      }
    });
    return Array.from(gaps);
  };

  // Mock data for AI-driven activity/performance
  const mockActivityData = {
    github: { lastActive: '2 days ago', usage: '75%' },
    leetcode: { lastActive: '5 hours ago', usage: '60%' },
    codechef: { lastActive: '1 week ago', usage: '30%' },
    linkedin: { lastActive: '1 hour ago', usage: '80%' },
    vercel: { lastActive: '3 days ago', usage: '50%' },
    netlify: { lastActive: '4 days ago', usage: '40%' },
  };

  const mockPerformanceData = {
    skillLevel: 75, // Percentage
    projectProgress: 80, // Percentage
  };

  // Mock AI-generated company prep data
  const getMockCompanyPrep = (companyName) => {
    const commonSkills = ['Data Structures', 'Algorithms', 'Problem Solving', 'System Design'];
    const commonAptitude = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'];
    const companySpecific = {
      'Google': {
        skills: [...commonSkills, 'Distributed Systems', 'Machine Learning', 'C++/Java/Python'],
        aptitude: [...commonAptitude, 'Advanced Puzzles'],
        papers: ['https://example.com/google-prev-papers', 'https://leetcode.com/tag/google/']
      },
      'Microsoft': {
        skills: [...commonSkills, 'Object-Oriented Design', 'Cloud Technologies (Azure)', 'C#/Java'],
        aptitude: [...commonAptitude, 'Coding Challenges'],
        papers: ['https://example.com/microsoft-prev-papers', 'https://interviewbit.com/microsoft-interview-questions/']
      },
      'Amazon': {
        skills: [...commonSkills, 'AWS', 'Distributed Systems', 'Leadership Principles'],
        aptitude: [...commonAptitude, 'Work Style Assessment'],
        papers: ['https://example.com/amazon-prev-papers', 'https://www.geeksforgeeks.org/amazon-interview-experience/']
      },
      'TCS': {
        skills: ['Java', 'Python', 'SQL', 'Basic Programming'],
        aptitude: ['Numerical Ability', 'Reasoning Ability', 'Verbal Ability'],
        papers: ['https://example.com/tcs-prev-papers', 'https://prepinsta.com/tcs-nqt/']
      },
      // Add more mock data for other companies
      'Default': {
        skills: ['General Programming', 'Core CS Concepts'],
        aptitude: ['Basic Aptitude'],
        papers: ['https://example.com/generic-prep']
      }
    };
    return companySpecific[companyName] || companySpecific['Default'];
  };

  // AI-Powered Daily Study Plan generation (Mock)
  const generateDailyStudyPlan = () => {
    const plan = [];
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    // Example: Academic subjects
    studentProfile.academicSchedule.slice(0, 1).forEach(subject => {
      plan.push({
        time: '9:00 AM - 11:00 AM',
        activity: `${subject.subject} (Academic Prep for ${subject.examDate})`,
        type: 'Academic'
      });
    });

    // Example: Skill improvement
    studentProfile.skillImprovementPlan.slice(0, 1).forEach(item => {
      if (item.status !== 'Completed') {
        plan.push({
          time: '2:00 PM - 4:00 PM',
          activity: `${item.skill} (Skill Improvement: ${item.resource})`,
        type: 'Skill Development'
      });
    }
  });

    // Example: Project work
    if (studentProfile.projectsCompleted.length > 0) {
      plan.push({
        time: '7:00 PM - 9:00 PM',
        activity: `Project Work: ${predefinedProjects.find(p => p.id === studentProfile.projectsCompleted[0])?.name || 'Your Project'} (Focus: Coding)`,
        type: 'Project'
      });
    } else {
      plan.push({
        time: '7:00 PM - 9:00 PM',
        activity: `Explore new project ideas in "Projects & Portfolio"`,
        type: 'Project'
      });
    }

    if (plan.length === 0) {
      plan.push({
        time: 'Flexible',
        activity: 'Update your profile to get a personalized study plan!',
        type: 'Guidance'
      });
    }

    setGeneratedDailyPlan(plan);
    setDailyPlanGenerated(true);
    setModalMessage("Your daily study plan has been generated!");
    setShowModal(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading TechPath AI...</div>
      </div>
    );
  }

  return (
    // Added overflow-x-hidden to prevent horizontal scrolling
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 flex flex-col overflow-x-hidden">
      {/* Removed Tailwind CSS CDN and Inter Font link from here. They should be in public/index.html */}

      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center rounded-b-lg">
        <h1 className="text-3xl font-bold text-indigo-700">TechPath AI</h1>
        <nav>
          <ul className="flex space-x-6">
            <li><button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>Dashboard</button></li>
            <li><button onClick={() => setCurrentView('profile')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>My Profile</button></li>
            <li><button onClick={() => setCurrentView('skills')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'skills' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>Skills & Learning</button></li>
            {/* Corrected duplicate className for Projects & Portfolio button */}
            <li><button onClick={() => setCurrentView('projects')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'projects' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>Projects & Portfolio</button></li>
            <li><button onClick={() => setCurrentView('opportunities')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'opportunities' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>Opportunities</button></li>
            <li><button onClick={() => setCurrentView('interview')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'interview' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>Interview Prep</button></li>
          </ul>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-8">
        {userId && (
          <div className="text-sm text-gray-500 mb-4 text-right">
            User ID: <span className="font-mono text-gray-600">{userId}</span>
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-semibold text-indigo-700 mb-6">Welcome to Your Personalized Dashboard!</h2>
            <p className="text-lg text-gray-700 mb-8">
              Get a quick overview of your progress and personalized next steps towards your dream career.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Column - Profile Summary & Action Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Summary */}
                <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-700 mb-3">Your TechPath Snapshot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 font-medium">Your Branch:</p>
                      <p className="text-lg text-gray-900">{studentProfile.branch || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Target Roles:</p>
                      {studentProfile.targetRoles.length > 0 ? (
                        <ul className="list-disc list-inside text-lg text-gray-900">
                          {studentProfile.targetRoles.map(roleId => {
                            const role = predefinedJobRoles.find(r => r.id === roleId);
                            return <li key={roleId}>{role ? role.name : roleId}</li>;
                          })}
                        </ul>
                      ) : (
                        <p className="text-lg text-gray-600 italic">None set. Update in My Profile!</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-700 font-medium">Your Current Skills:</p>
                    {studentProfile.programmingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {studentProfile.programmingSkills.map(skill => (
                          <span key={skill} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 italic">No skills added. Update in My Profile!</p>
                    )}
                  </div>
                </div>

                {/* Action Items / Next Steps */}
                <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200">
                  <h3 className="text-xl font-semibold text-green-700 mb-3">Your Next Steps</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {studentProfile.branch === '' && (
                      <li>Complete your <button onClick={() => setCurrentView('profile')} className="text-indigo-600 hover:underline font-medium">Branch information</button> in My Profile.</li>
                    )}
                    {studentProfile.targetRoles.length === 0 && (
                      <li>Select your <button onClick={() => setCurrentView('profile')} className="text-indigo-600 hover:underline font-medium">Target Job Roles</button> in My Profile.</li>
                    )}
                    {studentProfile.programmingSkills.length === 0 && (
                      <li>Add your <button onClick={() => setCurrentView('profile')} className="text-indigo-600 hover:underline font-medium">Programming Skills</button> in My Profile.</li>
                    )}
                    {getSkillGaps().length > 0 && (
                      <li>Address your <button onClick={() => setCurrentView('skills')} className="text-indigo-600 hover:underline font-medium">Identified Skill Gaps</button>.</li>
                    )}
                    {studentProfile.targetCompanies.length === 0 && (
                      <li>Add your <button onClick={() => setCurrentView('profile')} className="text-indigo-600 hover:underline font-medium">Dream Companies</button> for focused prep.</li>
                    )}
                    {!studentProfile.resumeURL && (
                      <li><button onClick={() => setCurrentView('profile')} className="text-indigo-600 hover:underline font-medium">Upload your Resume</button> for AI analysis.</li>
                    )}
                    {studentProfile.githubProfile === '' && (
                      <li>Link your <button onClick={() => setCurrentView('profile')} className="text-indigo-600 hover:underline font-medium">GitHub Profile</button> for portfolio tracking.</li>
                    )}
                    {studentProfile.academicSchedule.length === 0 && (
                      <li>Add your <button onClick={() => setCurrentView('skills')} className="text-indigo-600 hover:underline font-medium">Academic Subjects & Exam Dates</button>.</li>
                    )}
                    {studentProfile.skillImprovementPlan.length === 0 && (
                      <li>Create your first <button onClick={() => setCurrentView('skills')} className="text-indigo-600 hover:underline font-medium">Skill Improvement Plan</button>.</li>
                    )}
                    <li>Try the <button onClick={() => setCurrentView('interview')} className="text-indigo-600 hover:underline font-medium">AI-Powered Interview Practice</button>.</li>
                    {getRecommendedProjects().length > 0 && (
                      <li>Explore <button onClick={() => setCurrentView('projects')} className="text-indigo-600 hover:underline font-medium">Recommended Projects</button> to build your portfolio.</li>
                    )}
                    {getRecommendedInternships().length > 0 && (
                      <li>Check out <button onClick={() => setCurrentView('opportunities')} className="text-indigo-600 hover:underline font-medium">Recommended Internships</button>.</li>
                    )}
                    {studentProfile.targetRoles.length > 0 && studentProfile.programmingSkills.length > 0 && getSkillGaps().length === 0 && (
                      <li>You're on track! Keep honing your skills and exploring opportunities.</li>
                    )}
                  </ul>
                </div>

                {/* Target Company Preparation */}
                {studentProfile.targetCompanies.length > 0 && (
                  <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-200">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">Target Company Preparation</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      {studentProfile.targetCompanies.map(company => {
                        const companyPrep = getMockCompanyPrep(company);
                        return (
                          <li key={company}>
                            <span className="font-medium">{company}:</span>
                            <ul className="list-disc list-inside ml-6 text-gray-600 text-sm">
                              <li>Focused Skills: {companyPrep.skills.join(', ')}</li>
                              <li>Aptitude Topics: {companyPrep.aptitude.join(', ')}</li>
                              <li>Previous Papers: {companyPrep.papers.map((link, idx) => <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">Link {idx + 1}</a>)}</li>
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">*AI Vision: Company-specific prep materials are dynamically generated here.</p>
                  </div>
                )}
              </div>

              {/* Sidebar Column - Performance & Activity */}
              <div className="lg:col-span-1 space-y-6">
                {/* Performance Snapshot */}
                <div className="bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-200">
                  <h3 className="text-xl font-semibold text-yellow-700 mb-3">Performance Snapshot</h3>
                  <div className="mb-3">
                    <p className="text-gray-700 font-medium">Overall Skill Level:</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{ width: `${mockPerformanceData.skillLevel}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{mockPerformanceData.skillLevel}%</span>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Project Progress:</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{ width: `${mockPerformanceData.projectProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{mockPerformanceData.projectProgress}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">*AI-driven evaluation based on your activities (mock data shown).</p>
                </div>

                {/* AI-Driven Role Suitability Score */}
                <div className="bg-orange-50 p-6 rounded-lg shadow-sm border border-orange-200">
                  <h3 className="text-xl font-semibold text-orange-700 mb-3">Role Suitability Score</h3>
                  {studentProfile.targetRoles.length > 0 ? (
                    <div>
                      <p className="text-gray-700 font-medium">For your target roles:</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-orange-500 h-2.5 rounded-full"
                          style={{ width: `${mockPerformanceData.skillLevel + 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{mockPerformanceData.skillLevel + 10}% Match</span>
                      <p className="text-xs text-gray-500 mt-2">*AI Vision: This score reflects your overall fit based on skills, projects, and activity.</p>
                    </div>
                  ) : (
                    <p className="text-gray-600 italic">Define target roles in "My Profile" to see your suitability score.</p>
                  )}
                </div>

                {/* Activity Overview */}
                <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-700 mb-3">Activity Overview</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    {studentProfile.githubProfile && <li>GitHub: Last Active <span className="font-medium">{mockActivityData.github.lastActive}</span> | Usage: <span className="font-medium">{mockActivityData.github.usage}</span></li>}
                    {studentProfile.leetcodeProfile && <li>LeetCode: Last Active <span className="font-medium">{mockActivityData.leetcode.lastActive}</span> | Usage: <span className="font-medium">{mockActivityData.leetcode.usage}</span></li>}
                    {studentProfile.codechefProfile && <li>CodeChef: Last Active <span className="font-medium">{mockActivityData.codechef.lastActive}</span> | Usage: <span className="font-medium">{mockActivityData.codechef.usage}</span></li>}
                    {studentProfile.linkedinProfile && <li>LinkedIn: Last Active <span className="font-medium">{mockActivityData.linkedin.lastActive}</span> | Usage: <span className="font-medium">{mockActivityData.linkedin.usage}</span></li>}
                    {studentProfile.vercelProfile && <li>Vercel: Last Active <span className="font-medium">{mockActivityData.vercel.lastActive}</span> | Usage: <span className="font-medium">{mockActivityData.vercel.usage}</span></li>}
                    {studentProfile.netlifyProfile && <li>Netlify: Last Active <span className="font-medium">{mockActivityData.netlify.lastActive}</span> | Usage: <span className="font-medium">{mockActivityData.netlify.usage}</span></li>}
                    {!studentProfile.githubProfile && !studentProfile.leetcodeProfile && !studentProfile.codechefProfile && !studentProfile.linkedinProfile && !studentProfile.vercelProfile && !studentProfile.netlifyProfile && (
                      <p className="text-gray-600 italic">Link your profiles in "My Profile" to see activity.</p>
                    )}
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">*AI-driven activity tracking (mock data shown).</p>
                </div>

                {/* Quick Links to Recommendations */}
                {getRecommendedProjects().length > 0 && (
                  <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-200">
                    <h3 className="text-xl font-semibold text-purple-700 mb-3">Recommended Projects</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {getRecommendedProjects().slice(0, 3).map(project => (
                        <li key={project.id}>{project.name}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setCurrentView('projects')}
                      className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition-colors"
                    >
                      View All Projects
                    </button>
                  </div>
                )}

                {getRecommendedInternships().length > 0 && (
                  <div className="bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-200">
                    <h3 className="text-xl font-semibold text-yellow-700 mb-3">Recommended Internships</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {getRecommendedInternships().slice(0, 3).map(internship => (
                        <li key={internship.id}>{internship.name}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setCurrentView('opportunities')}
                      className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 transition-colors"
                    >
                      Explore Opportunities
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Profile View */}
        {currentView === 'profile' && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-semibold text-indigo-700 mb-6">My Profile</h2>
            <div className="space-y-6">
              {/* Branch Selection - Custom Dropdown */}
              <div className="relative" ref={branchDropdownRef}>
                <label htmlFor="branch" className="block text-lg font-medium text-gray-700 mb-2">Your B.Tech Branch:</label>
                <button
                  type="button"
                  className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={isBranchDropdownOpen ? 'true' : 'false'}
                  aria-labelledby="listbox-label"
                >
                  <span className="block truncate text-gray-900">
                    {studentProfile.branch || 'Select your branch'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    {/* Heroicon "Chevron Down" */}
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>

                {isBranchDropdownOpen && (
                  <ul
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    tabIndex="-1"
                    role="listbox"
                    aria-labelledby="listbox-label"
                  >
                    {predefinedBranches.map((branch) => (
                      <li
                        key={branch}
                        className={`text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9 ${
                          branch === studentProfile.branch ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-100 hover:text-indigo-900'
                        }`}
                        onClick={() => {
                          setStudentProfile(prev => ({ ...prev, branch: branch }));
                          setIsBranchDropdownOpen(false);
                          saveProfile(); // Save immediately after selection
                        }}
                        role="option"
                        aria-selected={branch === studentProfile.branch ? 'true' : 'false'}
                      >
                        <span className={`block truncate ${branch === studentProfile.branch ? 'font-semibold' : 'font-normal'}`}>
                          {branch}
                        </span>
                        {branch === studentProfile.branch && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                            {/* Heroicon "Check" */}
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Target Roles Selection */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Target IT Job Roles:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {predefinedJobRoles.map(role => (
                    <div key={role.id} className="flex items-center">
                      <input
                        id={`role-${role.id}`}
                        type="checkbox"
                        checked={studentProfile.targetRoles.includes(role.id)}
                        onChange={() => handleTargetRoleChange(role.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`role-${role.id}`} className="ml-2 text-gray-700 cursor-pointer">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Programming Skills Selection */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Your Programming Skills:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {predefinedSkills.map(skill => (
                    <div key={skill} className="flex items-center">
                      <input
                        id={`skill-${skill}`}
                        type="checkbox"
                        checked={studentProfile.programmingSkills.includes(skill)}
                        onChange={() => handleSkillChange(skill)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`skill-${skill}`} className="ml-2 text-gray-700 cursor-pointer">
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Companies */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Dream Companies / Target Placement Companies:</label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add company name (e.g., Google, TCS)"
                    value={newTargetCompany}
                    onChange={(e) => setNewTargetCompany(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={addTargetCompany}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {studentProfile.targetCompanies.length > 0 ? (
                  <ul className="space-y-2">
                    {studentProfile.targetCompanies.map(company => (
                      <li key={company} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                        <span className="text-gray-800">{company}</span>
                        <button
                          onClick={() => removeTargetCompany(company)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic text-sm">No target companies added yet.</p>
                )}
              </div>


              {/* External Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="githubProfile" className="block text-lg font-medium text-gray-700 mb-2">GitHub Profile URL:</label>
                  <input
                    type="url"
                    id="githubProfile"
                    name="githubProfile"
                    value={studentProfile.githubProfile}
                    onChange={handleProfileChange}
                    placeholder="e.g., https://github.com/yourusername"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="leetcodeProfile" className="block text-lg font-medium text-gray-700 mb-2">LeetCode Profile URL:</label>
                  <input
                    type="url"
                    id="leetcodeProfile"
                    name="leetcodeProfile"
                    value={studentProfile.leetcodeProfile}
                    onChange={handleProfileChange}
                    placeholder="e.g., https://leetcode.com/yourusername"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="codechefProfile" className="block text-lg font-medium text-gray-700 mb-2">CodeChef Profile URL:</label>
                  <input
                    type="url"
                    id="codechefProfile"
                    name="codechefProfile"
                    value={studentProfile.codechefProfile}
                    onChange={handleProfileChange}
                    placeholder="e.g., https://www.codechef.com/users/yourusername"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="linkedinProfile" className="block text-lg font-medium text-gray-700 mb-2">LinkedIn Profile URL:</label>
                  <input
                    type="url"
                    id="linkedinProfile"
                    name="linkedinProfile"
                    value={studentProfile.linkedinProfile}
                    onChange={handleProfileChange}
                    placeholder="e.g., https://www.linkedin.com/in/yourusername"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="vercelProfile" className="block text-lg font-medium text-gray-700 mb-2">Vercel Profile URL:</label>
                  <input
                    type="url"
                    id="vercelProfile"
                    name="vercelProfile"
                    value={studentProfile.vercelProfile}
                    onChange={handleProfileChange}
                    placeholder="e.g., https://vercel.com/yourusername"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="netlifyProfile" className="block text-lg font-medium text-gray-700 mb-2">Netlify Profile URL:</label>
                  <input
                    type="url"
                    id="netlifyProfile"
                    name="netlifyProfile"
                    value={studentProfile.netlifyProfile}
                    onChange={handleProfileChange}
                    placeholder="e.g., https://app.netlify.com/teams/yourusername"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <label htmlFor="resumeUpload" className="block text-lg font-medium text-gray-700 mb-2">Upload Your Resume (PDF/DOCX):</label>
                <input
                  type="file"
                  id="resumeUpload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {studentProfile.resumeURL && (
                  <p className="text-sm text-gray-600 mt-2">Resume uploaded: <a href={studentProfile.resumeURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Resume (Mock)</a></p>
                )}
                <p className="text-xs text-gray-500 mt-1">*AI Vision: Resume content will be analyzed to automatically update your skills and project history, and provide optimization suggestions.</p>
              </div>

              {/* Resume Analysis Report (Mock) */}
              {resumeUploaded && resumeAnalysisReport && (
                <div className="bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-200">
                  <h3 className="text-xl font-semibold text-yellow-700 mb-3">AI Resume Analysis Report:</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-gray-700">Identified Skills:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {resumeAnalysisReport.skillsIdentified.map(skill => (
                          <span key={skill} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Suggested Improvements:</p>
                      <ul className="list-disc list-inside text-gray-700 text-sm ml-4">
                        {resumeAnalysisReport.suggestedImprovements.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Keyword Optimization:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {resumeAnalysisReport.keywordOptimization.map(keyword => (
                          <span key={keyword} className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">*AI Vision: This report would be generated by an advanced NLP model.</p>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={saveProfile}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* Skills & Learning View */}
        {currentView === 'skills' && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-semibold text-indigo-700 mb-6">Skills & Learning Path</h2>
            <p className="text-lg text-gray-700 mb-8">
              Based on your target roles and current skills, here are recommended areas for improvement and resources.
            </p>

            {getSkillGaps().length > 0 ? (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-red-600 mb-4">Identified Skill Gaps:</h3>
                <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
                  {getSkillGaps().map(gap => (
                    <li key={gap}>
                      <span className="font-medium">{gap}</span> - Consider resources like:
                      <ul className="list-disc list-inside ml-6 text-gray-600 text-base">
                        {/* Placeholder for actual resource recommendations */}
                        <li>Online course on {gap} (e.g., Coursera, Udemy)</li>
                        <li>Practice problems on LeetCode/HackerRank</li>
                        <li>Relevant documentation/tutorials</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xl text-green-700 font-medium mb-8">Great! No major skill gaps identified for your selected roles. Keep learning!</p>
            )}

            {/* Personalized Daily Study Plan (AI-Generated) */}
            <div className="mb-10">
              <h3 className="text-2xl font-semibold text-indigo-700 mb-4">AI-Powered Daily Study Plan:</h3>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <p className="text-gray-700 italic mb-3">
                  *AI Vision:* This section will generate a dynamic daily/weekly study schedule that intelligently balances your academic subjects, skill improvement goals, and project work. It will adapt based on your progress and upcoming deadlines.
                </p>
                {!dailyPlanGenerated ? (
                  <button
                    onClick={generateDailyStudyPlan}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors"
                  >
                    Generate Daily Plan
                  </button>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">Your Plan for Today:</p>
                    <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                      {generatedDailyPlan.map((item, idx) => (
                        <li key={idx}>
                          <span className="font-medium">{item.time}:</span> {item.activity} <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'Academic' ? 'bg-blue-200 text-blue-800' : item.type === 'Skill Development' ? 'bg-green-200 text-green-800' : 'bg-purple-200 text-purple-800'}`}>{item.type}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setDailyPlanGenerated(false)} // Allow regenerating
                      className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
                    >
                      Clear Plan / Generate New
                    </button>
                  </div>
                )}
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mt-4">
                  [Placeholder for Interactive Dynamic Schedule Visualization]
                </div>
              </div>
            </div>

            {/* Flowcharts / Learning Paths (AI-Generated) */}
            <div className="mb-10">
              <h3 className="text-2xl font-semibold text-indigo-700 mb-4">AI-Powered Learning Paths (Flowcharts):</h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 italic mb-3">
                  *AI Vision:* Based on your target roles and skill gaps, this section will generate interactive flowcharts or structured learning paths. These will visually guide you through the sequence of skills to acquire, courses to take, and projects to complete to reach your goal.
                </p>
                <p className="text-gray-600 text-sm">Example: Path for "ML Engineer"</p>
                <ul className="list-disc list-inside text-gray-700 ml-4 mt-2">
                  <li>Foundation: Python, Calculus, Linear Algebra</li>
                  <li>Core ML: Supervised/Unsupervised Learning, Scikit-learn</li>
                  <li>Deep Learning: Neural Networks, TensorFlow/PyTorch, CNNs, RNNs</li>
                  <li>Deployment: Docker, Kubernetes, Cloud Platforms</li>
                  <li>Projects: Image Classifier, Predictive Model</li>
                </ul>
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mt-4">
                  [Placeholder for Interactive Flowchart / Visual Learning Path]
                </div>
              </div>
            </div>

            {/* Skill Improvement Plan */}
            <div className="mb-10">
              <h3 className="text-2xl font-semibold text-indigo-700 mb-4">My Skill Improvement Plan:</h3>
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Add New Skill to Improve:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Skill (e.g., Deep Learning)"
                    value={newSkillToImprove}
                    onChange={(e) => setNewSkillToImprove(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Resource (e.g., Coursera CNN course)"
                    value={newSkillResource}
                    onChange={(e) => setNewSkillResource(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <select
                    value={newSkillStatus}
                    onChange={(e) => setNewSkillStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <button
                  onClick={addSkillImprovement}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                >
                  Add Skill to Plan
                </button>
              </div>

              {studentProfile.skillImprovementPlan.length > 0 ? (
                <ul className="space-y-4">
                  {studentProfile.skillImprovementPlan.map(item => (
                    <li key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-800">{item.skill}</p>
                        <p className="text-gray-600 text-sm">Resource: {item.resource}</p>
                        <p className="text-gray-600 text-sm">Status: <span className={`font-medium ${item.status === 'Completed' ? 'text-green-600' : item.status === 'In Progress' ? 'text-blue-600' : 'text-red-600'}`}>{item.status}</span></p>
                      </div>
                      <div className="mt-3 md:mt-0 flex space-x-2">
                        <select
                          value={item.status}
                          onChange={(e) => updateSkillImprovementStatus(item.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <button
                          onClick={() => removeSkillImprovement(item.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No skill improvement plans added yet.</p>
              )}
            </div>

            {/* Academic Schedule */}
            <div>
              <h3 className="text-2xl font-semibold text-indigo-700 mb-4">My Academic Schedule:</h3>
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Add New Subject:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Subject Name (e.g., Operating Systems)"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <button
                  onClick={addAcademicSubject}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                >
                  Add Subject
                </button>
              </div>

              {studentProfile.academicSchedule.length > 0 ? (
                <ul className="space-y-4">
                  {studentProfile.academicSchedule.map(item => (
                    <li key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-800">{item.subject}</p>
                        <p className="text-gray-600 text-sm">Exam Date: {item.examDate}</p>
                      </div>
                      <button
                        onClick={() => removeAcademicSubject(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No academic subjects added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Projects & Portfolio View */}
          {currentView === 'projects' && (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-semibold text-indigo-700 mb-6">Projects & Portfolio Building</h2>
              <p className="text-lg text-gray-700 mb-8">
                Build a strong portfolio with impactful projects. Here are some recommendations based on your profile.
              </p>

              {/* AI-Driven Project Idea Generation */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-purple-700 mb-4">AI-Driven Project Idea Generator:</h3>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 flex flex-col items-center justify-center">
                  <p className="text-gray-700 italic text-center mb-4">
                    *AI Vision:* Get unique project ideas tailored to your skills, target roles, and current tech trends.
                  </p>
                  <button
                    onClick={generateNewProjectIdea}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Generate New Project Idea
                  </button>
                </div>
              </div>

              {getRecommendedProjects().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getRecommendedProjects().map(project => (
                    <div key={project.id} className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200">
                      <h3 className="text-xl font-semibold text-blue-700 mb-2">{project.name}</h3>
                      <p className="text-gray-700 mb-3 text-sm">{project.description}</p>
                      <p className="text-gray-600 text-sm mb-2"><span className="font-medium">Category:</span> {project.category}</p>
                      <p className="text-gray-600 text-sm"><span className="font-medium">Key Skills:</span> {project.skills.join(', ')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xl text-gray-600 font-medium">No project recommendations yet. Please update your profile with target roles and skills!</p>
              )}

              <div className="mt-10">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-4">GitHub Management & Best Practices:</h3>
                <p className="text-gray-700 mb-4">
                  A strong GitHub profile is crucial. Ensure your repositories are well-documented and showcase your best work.
                </p>
                {studentProfile.githubProfile ? (
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                    <p className="text-lg font-medium text-gray-800">Your GitHub Profile:</p>
                    <a
                      href={studentProfile.githubProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline break-words"
                    >
                      {studentProfile.githubProfile}
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-600 italic mb-4">No GitHub profile linked yet. Please add it in "My Profile" section.</p>
                )}

                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><span className="font-medium">Clear READMEs:</span> Every project should have a detailed README explaining its purpose, how to run it, and technologies used.</li>
                  <li><span className="font-medium">Regular Commits:</span> Show consistent activity and progress.</li>
                  <li><span className="font-medium">Meaningful Commit Messages:</span> Describe changes accurately.</li>
                  <li><span className="font-medium">Organized Repositories:</span> Keep your code clean and structured.</li>
                  <li><span className="font-medium">Pin Key Projects:</span> Highlight your best projects on your GitHub profile.</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  *Future AI Integration:* The AI could analyze your GitHub activity and suggest improvements for your profile and repositories.
                </p>
              </div>
            </div>
          )}

          {/* Opportunities View */}
          {currentView === 'opportunities' && (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-semibold text-indigo-700 mb-6">Placement Opportunities</h2>
              <p className="text-lg text-gray-700 mb-8">
                Explore internships, full-time roles, and hackathons tailored to your profile.
              </p>

              {/* AI-Powered Job Recommendations */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-blue-700 mb-4">AI-Powered Job Recommendations:</h3>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-gray-700 italic mb-3">
                    *AI Vision:* This section will display fresh job postings from official career pages daily, precisely matched to your dream roles, skills, and profile. You'll receive notifications for highly relevant openings.
                  </p>
                  <p className="text-gray-600 text-sm">Example Recommended Jobs (AI-matched):</p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 mt-2">
                    <li>Software Development Engineer I @ Amazon (Link)</li>
                    <li>Junior Data Scientist @ Google (Link)</li>
                    <li>Cloud DevOps Intern @ Microsoft (Link)</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-3">*Note: Direct job fetching from official career pages requires advanced web scraping capabilities or API access not available in this demo environment. This is a crucial future AI integration point.</p>
                </div>
              </div>

              {/* Internships */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-green-700 mb-4">Recommended Internships:</h3>
                {getRecommendedInternships().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getRecommendedInternships().map(internship => (
                      <div key={internship.id} className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200">
                        <h4 className="text-xl font-semibold text-green-800 mb-2">{internship.name}</h4>
                        <p className="text-gray-700 text-sm mb-2">{internship.description}</p>
                        <p className="text-gray-600 text-sm"><span className="font-medium">Skills:</span> {internship.skills.join(', ')}</p>
                        <p className="text-gray-600 text-sm"><span className="font-medium">Branches:</span> {internship.branch.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xl text-gray-600 font-medium">No internship recommendations yet. Update your profile!</p>
                )}
              </div>

              {/* Hackathons */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-purple-700 mb-4">Recommended Hackathons:</h3>
                {getRecommendedHackathons().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getRecommendedHackathons().map(hackathon => (
                      <div key={hackathon.id} className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-200">
                        <h4 className="text-xl font-semibold text-purple-800 mb-2">{hackathon.name}</h4>
                        <p className="text-gray-700 text-sm mb-2">{hackathon.description}</p>
                        <p className="text-gray-600 text-sm"><span className="font-medium">Focus Areas:</span> {hackathon.focus.join(', ')}</p>
                        <p className="text-gray-600 text-sm"><span className="font-medium">Date:</span> {hackathon.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xl text-gray-600 font-medium">No hackathon recommendations yet. Update your profile!</p>
                )}
              </div>

              {/* General Placement Information (Placeholder) */}
              <div>
                <h3 className="text-2xl font-semibold text-indigo-700 mb-4">General Placement Information:</h3>
                <p className="text-gray-700">
                  *Future Integration:* This section will provide information on on-campus and off-campus placement drives, company profiles, and interview experiences.
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mt-4 border border-gray-200">
                  <p className="text-gray-600 italic">Example:</p>
                  <ul className="list-disc list-inside text-gray-700 mt-2">
                    <li>Upcoming Campus Drives: TCS, Infosys, Wipro (Check university portal)</li>
                    <li>Off-campus Job Boards: LinkedIn, Indeed, Naukri.com</li>
                    <li>Interview Prep Resources: GeeksforGeeks, LeetCode, InterviewBit</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Interview Prep View */}
          {currentView === 'interview' && (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-semibold text-indigo-700 mb-6">AI-Powered Interview Practice</h2>
              <p className="text-lg text-gray-700 mb-8">
                Practice common interview questions and get AI-driven feedback to refine your responses.
              </p>

              <div className="mb-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-2xl font-semibold text-blue-700 mb-4">Question for You:</h3>
                <p className="text-xl text-gray-800 font-medium mb-4">{interviewQuestion}</p>
                <button
                  onClick={generateInterviewQuestion}
                  disabled={generatingQuestion}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingQuestion ? 'Generating...' : 'Generate New Question'}
                </button>
                <p className="text-xs text-gray-500 mt-2">*AI Vision: Questions will be tailored to your profile and target roles.</p>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Your Answer:</h3>
                <textarea
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                  placeholder="Type your answer here..."
                  value={interviewAnswer}
                  onChange={(e) => setInterviewAnswer(e.target.value)}
                ></textarea>
                <button
                  onClick={analyzeInterviewAnswer}
                  disabled={analyzingAnswer || !interviewAnswer.trim()}
                  className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzingAnswer ? 'Analyzing...' : 'Get AI Feedback'}
                </button>
              </div>

              {aiFeedback && (
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="text-2xl font-semibold text-yellow-700 mb-4">AI Feedback:</h3>
                  <p className="text-lg text-gray-800">{aiFeedback}</p>
                  <p className="text-xs text-gray-500 mt-2">*AI Vision: Feedback will be comprehensive, covering content, structure, and keywords.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modal for messages */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
              <p className="text-lg font-medium text-gray-800 mb-4">{modalMessage}</p>
              <button
                onClick={closeModal}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default App;
