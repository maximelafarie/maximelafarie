import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import words from 'profane-words';

export function updateReadmeCacheBuster(filenames: Record<string, string>) {
    const readmePath = path.join(__dirname, '../README.md');
    const readme = readFileSync(readmePath, 'utf-8');

    let updated = readme;
    for (const [name, filename] of Object.entries(filenames)) {
        const regex = new RegExp(`!\\[\\]\\(img\\/${name}\\.\\d+\\.png\\)`, 'g');
        updated = updated.replace(regex, `![](img/${filename})`);
    }

    writeFileSync(readmePath, updated);
}

export function updateReadmeMeta(author: string, permalink: string) {
    const readmePath = path.join(__dirname, '../README.md');
    const readme = readFileSync(readmePath, 'utf-8');

    const updated = readme.replace(
        /<sub>(.*?)See \[original post\]\([^)]+\)<\/sub>/,
        `<sub>Authored by: _${author}_ · See [original post](${permalink})</sub>`
    );

    writeFileSync(readmePath, updated);
}

export function cleanText(text: string): string {
    return text
        .replace(/\[([^\]]+)\]/g, '$1')
        .replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, '')
        .trim();
}

export function checkOffensiveContent(word: { example: string, definition: string, word: string }) {
    const checkText = (text: string) => {
        if (words.some(profaneWord => text.toLowerCase().includes(profaneWord))) {
            return true;
        }
        return false;
    };

    if (
        checkText(word.example) ||
        checkText(word.definition) ||
        checkText(word.word)
    ) {
        return true;
    }

    return false;
}