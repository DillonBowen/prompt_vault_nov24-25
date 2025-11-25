export interface Prompt {
    id: string;
    act: string;
    prompt: string;
    icon: string;
    category: string;
    tags: string[];
    isFavorite: boolean;
    usageCount: number;
    isVip?: boolean;
}
