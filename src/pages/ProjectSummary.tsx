import { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { Download, FileText, Loader2, Copy, Check, Package } from 'lucide-react';

export default function ProjectSummary() {
  const { currentProject } = useProjectStore();
  const [copied, setCopied] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No project selected</p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateClaudeSystemPrompt = () => {
    const project = currentProject;
    
    return `# Marketing Director System Instructions

You are the Marketing Director for the following project. Your role is to create compelling marketing materials, answer questions about strategy, and help execute the marketing plan based on the comprehensive research and analysis below.

## Project Overview
**Target Market**: ${project.offer?.targetMarket || 'N/A'}
**Core Problem**: ${project.offer?.pressingProblem || 'N/A'}
**Solution**: ${project.offer?.productDescription || 'N/A'}
**Core Promise**: ${project.offer?.productPromise || 'N/A'}
**Pricing**: ${project.offer?.pricing || 'N/A'}
**Guarantee**: ${project.offer?.guarantee || 'N/A'}

## Avatar Profile
**Demographics**: ${JSON.stringify(project.avatar?.demographics, null, 2)}
**Primary Currency**: ${project.avatar?.primaryCurrency || 'N/A'}
**Million Dollar Message**: ${project.avatar?.millionDollarMessage || 'N/A'}

### WEB Analysis (Wants, Emotions, Beliefs)
**Wants**: ${project.avatar?.webAnalysis?.wants?.join(', ') || 'N/A'}
**Emotions**: ${project.avatar?.webAnalysis?.emotions?.join(', ') || 'N/A'}
**Beliefs**: ${project.avatar?.webAnalysis?.beliefs?.join(', ') || 'N/A'}

## Your Responsibilities

As the Marketing Director, you should:

1. **Create Marketing Copy**
   - Write headlines, ads, emails, and sales copy
   - Use language patterns and emotional triggers identified in research
   - Apply the frameworks and methodologies (E5 VSL, Todd Brown's methodology)

2. **Strategic Guidance**
   - Answer questions about positioning and messaging
   - Recommend marketing tactics based on avatar insights
   - Suggest improvements to copy and campaigns

3. **Leverage Research**
   - Reference the detailed avatar research (manifold insights, pain points, desires)
   - Use competitor intelligence for differentiation
   - Apply psychological insights from the launch document

4. **Maintain Consistency**
   - Stay aligned with the core promise and unique mechanism
   - Use the approved tone, voice, and messaging framework
   - Reference the million dollar message and primary currency

## Instructions for Usage

When asked to create marketing materials:
- Reference the knowledge base for detailed insights
- Ask clarifying questions about specific deliverables needed
- Provide multiple options when appropriate
- Explain your strategic reasoning
- Use the frameworks and methodologies from the launch document

Always prioritize the avatar's language patterns, emotional triggers, and the core wound insights when crafting messages.`;
  };

  const generateClaudeKnowledgeBase = () => {
    const project = currentProject;
    let kb = `# ${project.name} - Marketing Knowledge Base\n\n`;
    kb += `Last Updated: ${new Date().toLocaleString()}\n\n`;
    kb += `---\n\n`;

    // Offer Details
    kb += `## OFFER DETAILS\n\n`;
    kb += `### Target Market\n${project.offer?.targetMarket || 'N/A'}\n\n`;
    kb += `### Pressing Problem\n${project.offer?.pressingProblem || 'N/A'}\n\n`;
    kb += `### Desired Outcome\n${project.offer?.desiredOutcome || 'N/A'}\n\n`;
    kb += `### Product/Service Description\n${project.offer?.productDescription || 'N/A'}\n\n`;
    kb += `### Product Promise\n${project.offer?.productPromise || 'N/A'}\n\n`;
    kb += `### Proof Elements\n${project.offer?.proofElements || 'N/A'}\n\n`;
    kb += `### Pricing & Payment Options\n${project.offer?.pricing || 'N/A'}\n\n`;
    kb += `### Guarantee / Risk Reversal\n${project.offer?.guarantee || 'N/A'}\n\n`;

    // Avatar Details
    kb += `## AVATAR PROFILE\n\n`;
    kb += `### Demographics\n\`\`\`json\n${JSON.stringify(project.avatar?.demographics, null, 2)}\n\`\`\`\n\n`;
    kb += `### Primary Currency\n${project.avatar?.primaryCurrency || 'N/A'}\n\n`;
    kb += `### Million Dollar Message\n${project.avatar?.millionDollarMessage || 'N/A'}\n\n`;

    // WEB Analysis
    kb += `### WEB Analysis\n\n`;
    kb += `**Wants (What they want)**:\n`;
    project.avatar?.webAnalysis?.wants?.forEach((want, i) => {
      kb += `${i + 1}. ${want}\n`;
    });
    kb += `\n**Emotions (How they feel)**:\n`;
    project.avatar?.webAnalysis?.emotions?.forEach((emotion, i) => {
      kb += `${i + 1}. ${emotion}\n`;
    });
    kb += `\n**Beliefs (What they believe)**:\n`;
    project.avatar?.webAnalysis?.beliefs?.forEach((belief, i) => {
      kb += `${i + 1}. ${belief}\n`;
    });
    kb += `\n`;

    // Empathy Map
    if (project.avatar?.empathyMap) {
      kb += `### Empathy Map\n\n`;
      kb += `**Thinking**: ${project.avatar.empathyMap.thinking?.join(', ') || 'N/A'}\n\n`;
      kb += `**Feeling**: ${project.avatar.empathyMap.feeling?.join(', ') || 'N/A'}\n\n`;
      kb += `**Saying**: ${project.avatar.empathyMap.saying?.join(', ') || 'N/A'}\n\n`;
      kb += `**Doing**: ${project.avatar.empathyMap.doing?.join(', ') || 'N/A'}\n\n`;
      kb += `**Pains**: ${project.avatar.empathyMap.pains?.join(', ') || 'N/A'}\n\n`;
      kb += `**Gains**: ${project.avatar.empathyMap.gains?.join(', ') || 'N/A'}\n\n`;
    }

    // Manifold Insights
    if (project.manifold) {
      kb += `## MANIFOLD INSIGHTS (14-Node Deep Avatar Analysis)\n\n`;
      
      Object.entries(project.manifold).forEach(([key, value]) => {
        const title = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        kb += `### ${title}\n\n${value}\n\n---\n\n`;
      });
    }

    // Competitor Intelligence
    if (project.competitors) {
      kb += `## COMPETITOR INTELLIGENCE\n\n`;
      kb += `### Industry/Niche\n${project.competitors.industry || 'N/A'}\n\n`;
      
      if (project.competitors.competitors?.length > 0) {
        kb += `### Competitors Analyzed\n`;
        project.competitors.competitors.forEach((comp, i) => {
          kb += `${i + 1}. ${comp.url || comp.name || 'Unknown'}\n`;
        });
        kb += `\n`;
      }

      if (project.competitors.positioningAngles?.length > 0) {
        kb += `### Positioning Angles\n`;
        project.competitors.positioningAngles.forEach((angle, i) => {
          kb += `${i + 1}. ${angle}\n`;
        });
        kb += `\n`;
      }

      if (project.competitors.marketGaps && project.competitors.marketGaps.length > 0) {
        kb += `### Market Gaps & Opportunities\n`;
        project.competitors.marketGaps.forEach((gap: string, i: number) => {
          kb += `${i + 1}. ${gap}\n`;
        });
        kb += `\n`;
      }
    }

    // Launch Document Sections
    if (project.launchDoc?.sections && project.launchDoc.sections.length > 0) {
      kb += `## LAUNCH DOCUMENT (38 Sections)\n\n`;
      kb += `*Complete marketing brief using Todd Brown's E5 VSL methodology*\n\n`;
      
      project.launchDoc.sections.forEach((section) => {
        kb += `### ${section.title}\n\n${section.content}\n\n---\n\n`;
      });
    }

    return kb;
  };

  const downloadFile = (content: string, filename: string, type: string = 'text/markdown') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportSystemPrompt = () => {
    const prompt = generateClaudeSystemPrompt();
    downloadFile(prompt, `${currentProject.name}-system-prompt.md`);
  };

  const exportKnowledgeBase = () => {
    const kb = generateClaudeKnowledgeBase();
    downloadFile(kb, `${currentProject.name}-knowledge-base.md`);
  };

  const exportOfferDocument = () => {
    const offer = currentProject.offer;
    let doc = `# Offer Document - ${currentProject.name}\n\n`;
    doc += `Generated: ${new Date().toLocaleString()}\n\n`;
    doc += `## Target Market\n${offer?.targetMarket || 'N/A'}\n\n`;
    doc += `## Pressing Problem\n${offer?.pressingProblem || 'N/A'}\n\n`;
    doc += `## Product/Service\n${offer?.productDescription || 'N/A'}\n\n`;
    doc += `## Core Promise\n${offer?.productPromise || 'N/A'}\n\n`;
    doc += `## Pricing\n${offer?.pricing || 'N/A'}\n\n`;
    doc += `## Guarantee\n${offer?.guarantee || 'N/A'}\n\n`;
    downloadFile(doc, `${currentProject.name}-offer.md`);
  };

  const exportAvatarDocument = () => {
    const avatar = currentProject.avatar;
    let doc = `# Avatar Profile - ${currentProject.name}\n\n`;
    doc += `Generated: ${new Date().toLocaleString()}\n\n`;
    doc += `## Demographics\n\`\`\`json\n${JSON.stringify(avatar?.demographics, null, 2)}\n\`\`\`\n\n`;
    doc += `## Million Dollar Message\n${avatar?.millionDollarMessage || 'N/A'}\n\n`;
    doc += `## Primary Currency\n${avatar?.primaryCurrency || 'N/A'}\n\n`;
    doc += `## WEB Analysis\n\n`;
    doc += `### Wants\n${avatar?.webAnalysis?.wants?.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n\n`;
    doc += `### Emotions\n${avatar?.webAnalysis?.emotions?.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n`;
    doc += `### Beliefs\n${avatar?.webAnalysis?.beliefs?.map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\n`;
    downloadFile(doc, `${currentProject.name}-avatar.md`);
  };

  const exportManifoldDocument = () => {
    const manifold = currentProject.manifold;
    let doc = `# Manifold Analysis - ${currentProject.name}\n\n`;
    doc += `Generated: ${new Date().toLocaleString()}\n\n`;
    Object.entries(manifold || {}).forEach(([key, value]) => {
      const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
      doc += `## ${title}\n\n${value}\n\n---\n\n`;
    });
    downloadFile(doc, `${currentProject.name}-manifold.md`);
  };

  const exportLaunchDocument = () => {
    const launchDoc = currentProject.launchDoc;
    let doc = `# Launch Document - ${currentProject.name}\n\n`;
    doc += `Generated: ${new Date().toLocaleString()}\n\n`;
    launchDoc?.sections?.forEach((section) => {
      doc += `## ${section.title}\n\n${section.content}\n\n---\n\n`;
    });
    downloadFile(doc, `${currentProject.name}-launch-document.md`);
  };

  const exportAllDocuments = async () => {
    setExportingAll(true);
    try {
      // Export all individual documents
      exportOfferDocument();
      await new Promise(resolve => setTimeout(resolve, 100));
      exportAvatarDocument();
      await new Promise(resolve => setTimeout(resolve, 100));
      if (currentProject.manifold) {
        exportManifoldDocument();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (currentProject.launchDoc) {
        exportLaunchDocument();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      exportSystemPrompt();
      await new Promise(resolve => setTimeout(resolve, 100));
      exportKnowledgeBase();
      
      alert('✅ All documents exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export some documents. Please try again.');
    } finally {
      setExportingAll(false);
    }
  };

  const systemPrompt = generateClaudeSystemPrompt();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Summary</h1>
        <p className="text-gray-600">
          Complete overview of your project with Claude AI integration
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Offer</div>
          <div className="text-2xl font-bold text-green-600">
            {currentProject.offer ? '✓' : '○'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Avatar</div>
          <div className="text-2xl font-bold text-green-600">
            {currentProject.avatar ? '✓' : '○'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Manifold (14 Nodes)</div>
          <div className="text-2xl font-bold text-green-600">
            {currentProject.manifold ? '✓' : '○'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Launch Doc (38 Sections)</div>
          <div className="text-2xl font-bold text-green-600">
            {currentProject.launchDoc?.sections && currentProject.launchDoc.sections.length > 0 ? '✓' : '○'}
          </div>
        </div>
      </div>

      {/* Claude Integration Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-xl border border-purple-200 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            Claude
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Claude AI Integration</h2>
            <p className="text-gray-600">Set up Claude as your Marketing Director</p>
          </div>
        </div>

        {/* System Instructions */}
        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-lg">System Instructions</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(systemPrompt)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={exportSystemPrompt}
                className="flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {systemPrompt}
            </pre>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>📋 How to use:</strong> Copy these instructions and paste them into your Claude Project's "Custom Instructions" section. This will configure Claude to act as your Marketing Director with full context of your project.
            </p>
          </div>
        </div>

        {/* Knowledge Base Export */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-lg">Knowledge Base File</h3>
            </div>
            <button
              onClick={exportKnowledgeBase}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              Download Knowledge Base
            </button>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">
              <strong>📚 Complete Marketing Knowledge Base:</strong> Download a single markdown file containing all your project research, insights, and documentation. Upload this file to your Claude Project to give Claude instant access to:
            </p>
            <ul className="text-sm text-blue-900 list-disc list-inside space-y-1 ml-4">
              <li>Offer details and positioning</li>
              <li>Complete avatar profile and psychology</li>
              <li>14-node manifold deep analysis</li>
              <li>Competitor intelligence</li>
              <li>All 38 launch document sections</li>
            </ul>
            <p className="text-sm text-blue-900 mt-3">
              <strong>💡 This allows Claude to reference your entire marketing strategy when creating copy, ads, emails, and campaigns.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Individual Exports */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Documents</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={exportOfferDocument}
            disabled={!currentProject.offer}
            className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">Offer Document</div>
                <div className="text-sm text-gray-600">Problem, solution, pricing</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={exportAvatarDocument}
            disabled={!currentProject.avatar}
            className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-semibold">Avatar Profile</div>
                <div className="text-sm text-gray-600">Demographics, WEB analysis</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={exportManifoldDocument}
            disabled={!currentProject.manifold}
            className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold">Manifold Analysis</div>
                <div className="text-sm text-gray-600">14-node deep insights</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={exportLaunchDocument}
            disabled={!currentProject.launchDoc?.sections || currentProject.launchDoc.sections.length === 0}
            className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-600" />
              <div className="text-left">
                <div className="font-semibold">Launch Document</div>
                <div className="text-sm text-gray-600">38 strategic sections</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={exportAllDocuments}
            disabled={exportingAll}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingAll ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Exporting All...
              </>
            ) : (
              <>
                <Package className="w-6 h-6" />
                Export All Documents (6 files)
              </>
            )}
          </button>
          <p className="text-sm text-gray-600 text-center mt-3">
            Downloads all project documents including system prompt and knowledge base
          </p>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Target Market</h3>
            <p className="text-gray-700">{currentProject.offer?.targetMarket || 'Not defined'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Core Problem</h3>
            <p className="text-gray-700">{currentProject.offer?.pressingProblem || 'Not defined'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Solution</h3>
            <p className="text-gray-700">{currentProject.offer?.productDescription || 'Not defined'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Million Dollar Message</h3>
            <p className="text-gray-700 italic">{currentProject.avatar?.millionDollarMessage || 'Not defined'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

