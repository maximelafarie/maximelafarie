import path from 'path';
import glob from 'fast-glob';
import { rimrafSync } from 'rimraf';

import { textToPngImage } from './generateImage';
import {
    checkOffensiveContent,
    updateReadmeMeta,
    updateReadmeCacheBuster,
    cleanText
} from './utils';
interface UrbanDictionnary {
    list: {
        definition: string;
        permalink: string;
        thumbs_up: number;
        author: string;
        word: string;
        defid: number;
        current_vote: string;
        written_on: Date;
        example: string;
        thumbs_down: number;
    }[];
}

type UrbanWordKey = 'word' | 'definition' | 'example' | 'vote';

const imagesToGenerate: { id: UrbanWordKey; fontSize: number; color: string; prefix?: string; }[] = [
    { id: 'word', 'fontSize': 200, 'color': '#E63946' },
    { id: 'definition', 'fontSize': 80, 'color': '#6C91A6' },
    { id: 'example', 'fontSize': 65, 'color': '#457B9D', prefix: 'Example:' },
    { id: 'vote', 'fontSize': 45, 'color': '#2A9D8F' },
];

function getWord() {
    fetch('https://api.urbandictionary.com/v0/random')
        .then((response) => response.json())
        .then((body: UrbanDictionnary) => {
            const cleanedList = body.list
                .map((word) => ({
                    ...word,
                    definition: cleanText(word.definition),
                    example: cleanText(word.example),
                    ratio: word.thumbs_up / (word.thumbs_down + 1)
                }))
                .filter(w => w.definition.length <= 250);

            const topUpvotes = cleanedList
                .sort((a, b) => b.thumbs_up - a.thumbs_up)
                .slice(0, 5);

            const best = topUpvotes
                .sort((a, b) => b.ratio - a.ratio)[0];

            if (!best) return getWord();

            if (checkOffensiveContent(best)) return getWord();

            const timestamp = Date.now();
            const filenames: Record<string, string> = {};

            imagesToGenerate.forEach((image) => {
                const outputFilename = `${image.id}.${timestamp}.png`;
                filenames[image.id] = outputFilename;
                const outputPath = path.join(__dirname, `../img/${outputFilename}`);

                const oldFiles = glob.sync(path.join(__dirname, `../img/${image.id}.*.png`));
                oldFiles.forEach(file => rimrafSync(file));

                if (image.id === 'example' && best.example === best.definition) return;

                let text = '';
                if (image.id === 'vote') {
                    text = `(+${best.thumbs_up} | -${best.thumbs_down})`;
                } else {
                    text = image.prefix ? `${image.prefix} ${best[image.id]}` : best[image.id];
                }

                textToPngImage({
                    text,
                    fontPath: './fonts/Tagesschrift/Tagesschrift-Regular.ttf',
                    fontFamily: 'Tagesschrift',
                    fontSize: image.fontSize,
                    color: image.color,
                    outputPath,
                    maxWidth: 2000
                });
            });

            updateReadmeMeta(best.author, best.permalink);
            updateReadmeCacheBuster(filenames);
        })
        .catch(e => {
            throw e;
        });
}

getWord();
