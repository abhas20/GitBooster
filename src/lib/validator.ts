import {z} from 'zod'

export const repoValidator = z.object({
  name: z.string().optional(),
  url: z.string().url({ message: "Invalid URL" }).min(1, { message: "Repository URL is required" }),
});

export const  parseRepo = (input:string) => {
    input=input.trim();
    if(input.includes("github.com")){
        const parts = input.split("github.com/")[1].split("/");
        if(parts.length >= 2){
            const owner = parts[0];
            const repo = parts[1].replace(/.git$/,"");
            return {owner, repo};
        }
    }
}