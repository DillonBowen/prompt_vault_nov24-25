import { Prompt } from '../types/prompt';
import Papa from 'papaparse';

const getIconForAct = (act: string): string => {
    const lowerAct = act.toLowerCase();
    if (lowerAct.includes('developer') || lowerAct.includes('code') || lowerAct.includes('engineer') || lowerAct.includes('terminal') || lowerAct.includes('interpreter') || lowerAct.includes('php') || lowerAct.includes('python') || lowerAct.includes('sql') || lowerAct.includes('javascript') || lowerAct.includes('console')) return '💻';
    if (lowerAct.includes('writer') || lowerAct.includes('poet') || lowerAct.includes('novelist') || lowerAct.includes('storyteller') || lowerAct.includes('essay') || lowerAct.includes('screenwriter') || lowerAct.includes('copywriter')) return '✍️';
    if (lowerAct.includes('designer') || lowerAct.includes('artist') || lowerAct.includes('svg') || lowerAct.includes('painter') || lowerAct.includes('decorator')) return '🎨';
    if (lowerAct.includes('seo') || lowerAct.includes('analyst') || lowerAct.includes('statistician') || lowerAct.includes('accountant') || lowerAct.includes('manager') || lowerAct.includes('strategist')) return '📊';
    if (lowerAct.includes('teacher') || lowerAct.includes('coach') || lowerAct.includes('mentor') || lowerAct.includes('guide') || lowerAct.includes('tutor') || lowerAct.includes('instructor')) return '🧑‍🏫';
    if (lowerAct.includes('movie') || lowerAct.includes('film') || lowerAct.includes('critic') || lowerAct.includes('actor')) return '🎬';
    if (lowerAct.includes('doctor') || lowerAct.includes('health') || lowerAct.includes('psychologist') || lowerAct.includes('therapist') || lowerAct.includes('nurse') || lowerAct.includes('dentist')) return '🩺';
    if (lowerAct.includes('chef') || lowerAct.includes('cook') || lowerAct.includes('food') || lowerAct.includes('dietitian')) return '🍳';
    if (lowerAct.includes('music') || lowerAct.includes('composer') || lowerAct.includes('rapper') || lowerAct.includes('singer')) return '🎵';
    if (lowerAct.includes('game') || lowerAct.includes('player') || lowerAct.includes('gamer')) return '🎮';
    return '✨';
};

export const parsePrompts = async (): Promise<Prompt[]> => {
    try {
        const response = await fetch('/prompts.csv');
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedPrompts: Prompt[] = results.data.map((p: any, index: number) => ({
                        id: `${index}-${p.act?.replace(/\s+/g, '-') || 'unknown'}`,
                        act: p.act || 'Untitled',
                        prompt: p.prompt || '',
                        icon: getIconForAct(p.act || ''),
                        category: (p.act || 'General').split(' ')[0],
                        tags: (p.act || '').toLowerCase().split(/\s+/),
                        isFavorite: false,
                        usageCount: 0,
                    })).filter((p: Prompt) => p.prompt.length > 0);
                    resolve(parsedPrompts);
                },
                error: (error: any) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error("Failed to load prompts:", error);
        return [];
    }
};
