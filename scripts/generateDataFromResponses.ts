import csv from "csvtojson"
import fs from "node:fs/promises"
import type { CollectionEntry } from "astro:content";
import { stringify } from "yaml";

const HEADERS = [
    "timestamp",
    "videoUrl",
    "fullName",
    "studentNumber",
    "personalEmail",
    "personalProfile",
    "workDescription",
    "portfolioUrl",
    "profileImageUrl",
    "featuredImageUrl",
    "workType",
    "recentFavorite",
    "ownDeviceOrWifi",
    "workFileUrl",
    "workTitle"
] as const

type AllHeaders = {
  [K in typeof HEADERS[number]]: string;
};

const IGNORED = ["timestamp", "ownDeviceOrWifi"] as const

type ExpoSubmission = Omit<AllHeaders, typeof IGNORED[number]>

type Project = Omit<CollectionEntry<"projects">["data"], "image" | "students"> & { image?: string, students: Array<string> }
type Student = Omit<CollectionEntry<"students">["data"], "image"> & { image?: string }

const IMAGE_DIR = "scripts/data/images";
const OUTPUT_DIR = "scripts/data"
const IMAGE_OUTPUT_DIR = "/src/assets/images"
const images = await fs.readdir(IMAGE_DIR)

const downloadImage = async (imageId: string, fileName: string): Promise<string> => {
    const existingImageName = images.find(imageFile => imageFile.split(".")[0] === fileName)

    if(existingImageName || !imageId) {
        return `${IMAGE_OUTPUT_DIR}/${existingImageName}`
    }

    const response = await fetch(`http://drive.google.com/uc?export=download&id=${imageId}`)
    const image = await response.blob()

    const fileExt = image.type.split("/").at(-1)

    await fs.writeFile(`${IMAGE_DIR}/${fileName}.${fileExt}`, image.stream())

    return `${IMAGE_OUTPUT_DIR}/${fileName}.${fileExt}`
}

const convertCategory = (category: string): Project["category"] => {
    const map: Record<string, Project["category"]>  = {
        "Video essay": "research",
        "Games/Interactivity": "interactivity",
        "Animation": "animation",
        "Games": "games",
    }
    
    return map[category]
}

const convertToMarkdown = async (frontmatter: Object, body: string, outputPath: string) => {
    let result = "---\n"

    result += stringify(frontmatter)

    result += "---\n"

    result += body

    await fs.writeFile(outputPath,result)
}

const generateDataFromResponses = async () => {
    const path = process.argv[2]

    if(!path) {
        console.error("No path provided")
        return
    }
    await fs.mkdir(IMAGE_DIR, { recursive: true })
    await fs.mkdir(`${OUTPUT_DIR}/students`, { recursive: true })
    await fs.mkdir(`${OUTPUT_DIR}/projects`, { recursive: true })

    // needs to be mutuable for some reason, so clone it
    const headers = [...HEADERS]

    const submissions: Array<ExpoSubmission> = await csv({
        delimiter: "\t",
        noheader: false,
        headers: headers,
        ignoreColumns: new RegExp(IGNORED.join("|"))

    }).fromFile(path)

    const websiteRegex = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/
    const imageIdRegex = /(?<=id=)[^&?]+/

    for(const submission of submissions) {
        if(!submission.fullName) {
            console.error("Student does not have a name!", submission.fullName)
        }

        const projectName = submission.workTitle
            ? submission.workTitle
            : `Untitled Work — ${submission.fullName}`
        
        const studentFileName = convertToUrl(submission.fullName)
        const projectFileName = convertToUrl(projectName)
        
        const links: Student["links"] = {}
        let recentFavourite: string | undefined

        if(websiteRegex.test(submission.portfolioUrl)) {
            links.website = fixUrl(submission.portfolioUrl)
        } else {
            console.warn(`${submission.fullName} does not have a valid portfolio: ${submission.portfolioUrl}`)
        }

        const profileImageId = submission.profileImageUrl.match(imageIdRegex)
        const projectImageId = submission.featuredImageUrl.match(imageIdRegex)

        let profileImagePath: string | undefined
        let projectImagePath: string | undefined

        if(profileImageId) {
            profileImagePath = await downloadImage(profileImageId[0], studentFileName)
        }

        if(projectImageId) {
            projectImagePath = await downloadImage(projectImageId[0], projectFileName)
        }

        if(submission.recentFavorite) {
            recentFavourite = submission.recentFavorite
        }

        const student: Student = {
            name: submission.fullName,
            links,
            image: profileImagePath,
            fav: recentFavourite
        }

        const project: Project = {
            title: projectName,
            image: projectImagePath,
            students: [`@${studentFileName}`],
            category: convertCategory(submission.workType),
        }
        

        const studentBody = submission.personalProfile
        const projectBody = submission.workDescription

        Promise.all([
            convertToMarkdown(student, studentBody, `${OUTPUT_DIR}/students/${studentFileName}.md`),
            convertToMarkdown(project, projectBody, `${OUTPUT_DIR}/projects/${projectFileName}.md`),
        ])
    }
}

await generateDataFromResponses()

function convertToUrl(value: string) {
    return value
        .replace(/[^a-z0-9_]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
}

function fixUrl(urlString: string) {
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        return 'https://' + urlString;
    }
    return urlString;
}