export const MOCK_USER = {
    name: 'Aryan Sharma',
    username: 'aryan-dev',
    target_role: 'ML Engineer',
    career_readiness: 58,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aryan',
}

export const MOCK_GRAPH = {
    nodes: [
        { id: 'react', name: 'React', category: 'frontend', maturity: 87, market_demand: 92, val: 8.7, source: 'github' },
        { id: 'javascript', name: 'JavaScript', category: 'frontend', maturity: 82, market_demand: 88, val: 8.2, source: 'github' },
        { id: 'css3', name: 'CSS', category: 'frontend', maturity: 74, market_demand: 70, val: 7.4, source: 'github' },
        { id: 'html5', name: 'HTML', category: 'frontend', maturity: 70, market_demand: 65, val: 7.0, source: 'github' },
        { id: 'nodejs', name: 'Node.js', category: 'backend', maturity: 61, market_demand: 80, val: 6.1, source: 'github' },
        { id: 'express', name: 'Express', category: 'backend', maturity: 58, market_demand: 72, val: 5.8, source: 'github' },
        { id: 'python', name: 'Python', category: 'backend', maturity: 61, market_demand: 95, val: 6.1, source: 'github' },
        { id: 'fastapi', name: 'FastAPI', category: 'backend', maturity: 54, market_demand: 78, val: 5.4, source: 'github' },
        { id: 'mongodb', name: 'MongoDB', category: 'database', maturity: 45, market_demand: 74, val: 4.5, source: 'github' },
        { id: 'numpy', name: 'NumPy', category: 'ml', maturity: 34, market_demand: 85, val: 3.4, source: 'github' },
        { id: 'jupyter', name: 'Jupyter', category: 'ml', maturity: 30, market_demand: 72, val: 3.0, source: 'github' },
        { id: 'git', name: 'Git', category: 'devops', maturity: 78, market_demand: 90, val: 7.8, source: 'github' },
        // Concepts don't have devicons, so we use fallback text
        { id: 'ml-roadmap', name: 'ML Roadmap', category: 'concept', maturity: 40, market_demand: 60, val: 4.0, source: 'notion', icon: '🗺️' },
        { id: 'sys-design', name: 'System Design', category: 'concept', maturity: 35, market_demand: 88, val: 3.5, source: 'notion', icon: 'SD' },
        { id: 'meta-cert', name: 'Meta Frontend', category: 'cert', maturity: 100, market_demand: 85, val: 10.0, source: 'cert', icon: '🏅' },
    ],
    links: [
        { source: 'react', target: 'javascript', type: 'BUILT_WITH', label: 'built with', strength: 0.95 },
        { source: 'react', target: 'css3', type: 'STYLES_WITH', label: 'styles with', strength: 0.80 },
        { source: 'react', target: 'html5', type: 'RENDERS', label: 'renders', strength: 0.75 },
        { source: 'javascript', target: 'nodejs', type: 'RELATED_TO', strength: 0.80 },
        { source: 'nodejs', target: 'express', type: 'RELATED_TO', strength: 0.90 },
        { source: 'express', target: 'mongodb', type: 'RELATED_TO', strength: 0.70 },
        { source: 'python', target: 'numpy', type: 'RELATED_TO', strength: 0.85 },
        { source: 'python', target: 'fastapi', type: 'RELATED_TO', strength: 0.75 },
        { source: 'python', target: 'jupyter', type: 'RELATED_TO', strength: 0.70 },
        { source: 'numpy', target: 'jupyter', type: 'RELATED_TO', strength: 0.65 },
        { source: 'ml-roadmap', target: 'numpy', type: 'MENTIONS', strength: 0.60 },
        { source: 'ml-roadmap', target: 'python', type: 'MENTIONS', strength: 0.55 },
        { source: 'sys-design', target: 'nodejs', type: 'MENTIONS', strength: 0.50 },
        { source: 'sys-design', target: 'mongodb', type: 'MENTIONS', strength: 0.45 },
        { source: 'meta-cert', target: 'react', type: 'VALIDATES', label: 'validates', strength: 0.90 },
        { source: 'meta-cert', target: 'javascript', type: 'VALIDATES', label: 'validates', strength: 0.85 },
        { source: 'meta-cert', target: 'css3', type: 'VALIDATES', label: 'validates', strength: 0.80 },
        { source: 'git', target: 'nodejs', type: 'RELATED_TO', strength: 0.40 },
        { source: 'git', target: 'python', type: 'RELATED_TO', strength: 0.40 },
    ],
}

export const MOCK_GAPS = [
    { skill: 'PyTorch', priority: 0.94, reason: 'Core framework for ML Engineer role — essential for deep learning models' },
    { skill: 'scikit-learn', priority: 0.88, reason: 'Essential for classical ML workflows — regression, classification, clustering' },
    { skill: 'Docker', priority: 0.72, reason: 'Required for production ML deployment and containerized workflows' },
    { skill: 'TensorFlow', priority: 0.68, reason: 'Widely used in industry for production ML systems' },
    { skill: 'SQL', priority: 0.55, reason: 'Data querying is fundamental for any data-heavy ML role' },
]

export const MOCK_ROADMAP = {
    phases: [
        {
            title: 'Foundation',
            duration: '4 weeks',
            skills: ['PyTorch', 'scikit-learn'],
            resources: ['Coursera ML Specialization', 'Fast.ai Practical Deep Learning'],
        },
        {
            title: 'Core Skills',
            duration: '8 weeks',
            skills: ['TensorFlow', 'Deep Learning'],
            resources: ['PyTorch Official Tutorials', 'Kaggle Competitions'],
        },
        {
            title: 'Production & Deployment',
            duration: '4 weeks',
            skills: ['Docker', 'MLOps', 'CI/CD'],
            resources: ['Docker Mastery on Udemy', 'MLOps Zoomcamp'],
        },
    ],
    total_duration: '4 months',
    career_readiness_after: 82,
}

export const MOCK_RECRUITER = {
    name: 'Aryan Sharma',
    username: 'aryan-dev',
    target_role: 'ML Engineer',
    career_readiness: 58,
    skill_maturity_avg: 60.7,
    project_depth: 100,
    market_alignment: 78.3,
    risk_areas: ['NumPy', 'Jupyter', 'System Design'],
    top_skills: [
        { name: 'Meta Frontend', maturity: 100, category: 'cert' },
        { name: 'React', maturity: 87, category: 'frontend' },
        { name: 'JavaScript', maturity: 82, category: 'frontend' },
        { name: 'Git', maturity: 78, category: 'devops' },
        { name: 'CSS', maturity: 74, category: 'frontend' },
    ],
    skill_distribution: { frontend: 4, backend: 4, ml: 2, devops: 1, database: 1, concept: 2, cert: 1 },
    radar_data: [
        { axis: 'Frontend', value: 78.3 },
        { axis: 'Backend', value: 58.5 },
        { axis: 'ML/AI', value: 32.0 },
        { axis: 'DevOps', value: 78.0 },
        { axis: 'Database', value: 45.0 },
        { axis: 'Concepts', value: 37.5 },
    ],
    total_skills: 15,
    total_sources: 3,
}

export const CATEGORY_COLORS: Record<string, string> = {
    frontend: '#FF7A00', // Primary orange from image
    backend: '#10B981',  // Pastel green
    ml: '#8B5CF6',       // Pastel violet
    devops: '#6366F1',   // Indigo
    database: '#F43F5E', // Rose
    concept: '#64748B',  // Slate
    cert: '#F59E0B',     // Amber
}

export const CATEGORY_LABELS: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    ml: 'ML / AI',
    devops: 'DevOps',
    database: 'Database',
    concept: 'Concepts',
    cert: 'Certifications',
}
