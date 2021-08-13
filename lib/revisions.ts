import { diffWords } from "diff"

export const diff = (answer: string, answerToCompare: string): string => {
  let result = ""

  diffWords(answer, answerToCompare).forEach(part => {
    if (part.added) {
      result += `<ins role="insertion">${part.value}</ins>`
    } else if (part.removed) {
      result += `<del role="deletion">${part.value}</del>`
    } else {
      result += part.value
    }
  })
  return result
}
