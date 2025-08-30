import { stringify } from "yaml";
import convertToUrl from "../src/lib/convertUrl";

const studentFirstNames = [
  "Charlotte", "Jack", "Olivia", "William", "Amelia",
  "Thomas", "Isla", "James", "Mia", "Oliver",
  "Ava", "Noah", "Grace", "Lucas", "Zoe",
  "Lachlan", "Ruby", "Alexander", "Chloe", "Henry",
  "Wei", "Jing", "Li", "Min", "Chen",
  "Xiao", "Yang", "Hui", "Feng", "Yan",
  "Ling", "Jie", "Mei", "Hong", "Tao",
  "Minh", "Anh", "Thanh", "Lan", "Huy",
  "Trang", "Duc", "Nga", "Tuan", "Thao",
  "Bao", "Linh", "Khoi", "Mai", "Phuc",
  "Elena", "Nicholas", "Sophia", "George", "Maria",
  "Christos", "Katerina", "Dimitri", "Anna", "Theo",
  "Stella", "Peter", "Georgia", "Michael", "Alexandra",
  "Marco", "Sofia", "Luca", "Isabella", "Giovanni",
  "Giulia", "Antonio", "Francesca", "Matteo", "Alessia",
  "Arjun", "Priya", "Rohan", "Saanvi", "Vikram",
  "Anika", "Rahul", "Diya", "Aarav", "Meera",
  "Mohamed", "Layla", "Omar", "Aisha", "Ali",
  "Fatima", "Hassan", "Zara", "Youssef", "Leila"
];

const studentLastNames = [
  "Smith", "Jones", "Brown", "Wilson", "Taylor",
  "Williams", "White", "Martin", "Anderson", "Thompson",
  "King", "Green", "Harris", "Clark", "Robinson",
  "Wang", "Li", "Zhang", "Liu", "Chen",
  "Yang", "Huang", "Zhao", "Wu", "Zhou",
  "Xu", "Sun", "Ma", "Zhu", "Hu",
  "Nguyen", "Tran", "Le", "Pham", "Hoang",
  "Huynh", "Vu", "Dang", "Bui", "Do",
  "Ngo", "Duong", "Ly", "Truong", "Phan",
  "Papadopoulos", "Ioannou", "Georgiou", "Constantinou", "Antoniou",
  "Papageorgiou", "Vlachos", "Nikolaou", "Karagiannis", "Oikonomou",
  "Pappas", "Vasiliou", "Theodorou", "Athanasopoulos", "Christodoulou",
  "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi",
  "Romano", "Colombo", "Ricci", "Marino", "Greco",
  "Conti", "De Luca", "Mancini", "Costa", "Giordano",
  "Patel", "Singh", "Kumar", "Sharma", "Ali",
  "Ahmed", "Khan", "Rahman", "Gupta", "Malik",
  "Elahi", "Hussein", "Ibrahim", "Osman", "Abdullah",
  "Mohamed", "Hassan", "Abdel", "Farah", "Khalil"
];

const LOREM_IPSUM = `Fugit quia quis ex dolor est provident aliquam. Ut impedit molestiae perferendis amet. Ea odit laborum excepturi aut.

Quis illum corporis animi sed repudiandae. Corporis a provident numquam aut vitae. Qui laboriosam laborum repellat et aut ea qui.

Architecto incidunt consectetur rerum quod eum eum unde itaque. Autem voluptatem reprehenderit quia labore et quidem voluptatum. Iste aut debitis et eos. Asperiores modi harum aliquid enim.`

const genreateStudentData = () => {
    const name = `${
        studentFirstNames[Math.floor(Math.random() * studentFirstNames.length)]
    } ${
        studentLastNames[Math.floor(Math.random() * studentLastNames.length)]
    }`

    const useInstagram = Math.random() > 0.6 
    const links = {
        instagram: useInstagram 
            ? "@example" 
            : undefined,
        website: useInstagram 
            ? Math.random() > 0.5 
                ? undefined 
                : "https://example.com"
            : "https://example.com"
    }

    const frontmatter = {
        name, 
        links
    }

    let result = "---\n"

    result += stringify(frontmatter)

    result += "---\n"

    result += LOREM_IPSUM.slice(0, Math.floor(Math.random() * 100) + 100)

    return {
        data: result,
        filename: convertToUrl(name),
        id: `@${convertToUrl(name)}`
    }
}

const splitData = LOREM_IPSUM
    .split(" ") 
    .map(word => word.replace(/[^\w]/, ""))
    .map(word => word.trim())
    .map(word => `${Math.random() > 0.75 ? "The " : ""}${word[0].toUpperCase()}${word.slice(1)}`)

const generateProjectData = (studentIds: string[]) => {
    const title = splitData[Math.floor(Math.random() * splitData.length)]

    const students = Array.from({length: Math.floor(Math.random() * 3) + 1}, 
        () => studentIds[Math.floor(Math.random() * studentIds.length)])

    const image = `/src/assets/${Math.floor(Math.random() * 3)}.jpg`

    const category = ["games", "interactivity", "animation", "research"][Math.floor(Math.random() * 4)]

    const frontmatter = {
        title, 
        students,
        image,
        category
    }

    let result = "---\n"

    result += stringify(frontmatter)

    result += "---\n"

    result += LOREM_IPSUM.slice(0, Math.floor(Math.random() * 100) + 100)

    return {
        data: result,
        filename: convertToUrl(title),
    }
}


const students = Array.from({length: 100}, genreateStudentData)
const projects = Array.from({length: 73}, () => generateProjectData(students.map(({id}) => id)))

import * as fs from "node:fs/promises"

await fs.mkdir("./scripts/students")
await fs.mkdir("./scripts/projects")

for(const student of students) {
    await fs.writeFile(`./scripts/students/${student.filename}.md`, student.data)
}

for(const project of projects) {
    await fs.writeFile(`./scripts/projects/${project.filename}.md`, project.data)
}