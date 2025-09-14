import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ReactNode, JSX } from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAnalysis = (text: string): ReactNode[] => {
  const lines = text.split('\n').filter(line => line.trim())

  // Filter out repetitive title lines that contain "Analysis of" and "Bilateral Tariff"
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim().toLowerCase()
    return !(
      (trimmed.includes('analysis of') && trimmed.includes('bilateral tariff')) ||
      trimmed.startsWith('### analysis of') ||
      trimmed.startsWith('## analysis of') ||
      trimmed.includes('bilateral tariff flow')
    )
  })

  return filteredLines
    .map((line, index) => {
      const trimmedLine = line.trim()

      // 1. Handle Markdown-style headers (e.g., #### Header)
      if (trimmedLine.startsWith('#')) {
        const level = trimmedLine.match(/^#+/)?.[0].length || 1
        const text = trimmedLine.replace(/^#+\s*/, '')
        const Tag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements
        return (
          <Tag key={index} className="font-semibold text-white text-lg mb-3 mt-4">
            {text}
          </Tag>
        )
      }

      // 2. Handle entirely bolded lines as headers
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const text = trimmedLine.substring(2, trimmedLine.length - 2)
        return (
          <p key={index} className="font-semibold text-white text-base mb-2">
            {text}
          </p>
        )
      }

      // Compute indentation level (2 spaces per level)
      const leadingSpaces = (line.match(/^\s*/)?.[0].length || 0)
      const indentLevel = Math.floor(leadingSpaces / 2)
      const indentStyle = indentLevel > 0 ? { marginLeft: indentLevel * 12 } : undefined

      // 3. Handle numbered lists (e.g., "1. Item" or "1) Item")
      const numberedMatch = line.match(/^\s*(\d+)[\.|\)]\s+(.*)$/)
      if (numberedMatch) {
        const number = numberedMatch[1]
        const contentRaw = numberedMatch[2]
        const contentHtml = contentRaw.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        return (
          <div key={index} className="flex items-start space-x-2 mb-2" style={indentStyle}>
            <span className="text-blue-400 text-sm mt-1 font-medium">{number}.</span>
            <span className="text-white/90 text-sm" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        )
      }

      // 4. Handle bullet points (supports -, •, *, –, —)
      const bulletMatch = line.match(/^\s*([•\-*—–])\s+(.*)$/)
      if (bulletMatch) {
        const bullet = bulletMatch[1]
        const contentRaw = bulletMatch[2]
        const marker = bullet === '•' || bullet === '*' ? '•' : '–'
        const contentHtml = contentRaw.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        return (
          <div key={index} className="flex items-start space-x-2 mb-2" style={indentStyle}>
            <span className="text-blue-400 text-sm mt-1">{marker}</span>
            <span className="text-white/90 text-sm" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        )
      }

      // 5. Handle paragraphs with inline bolding
      if (trimmedLine.includes('**')) {
        const formattedLine = trimmedLine.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-white">$1</strong>',
        )
        return (
          <p
            key={index}
            className="text-white/90 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        )
      }

      // 6. Handle regular paragraphs
      if (trimmedLine.length > 0) {
        return (
          <p key={index} className="text-white/90 text-sm leading-relaxed">
            {trimmedLine}
          </p>
        )
      }

      return null
    })
    .filter(Boolean) as ReactNode[]
}
