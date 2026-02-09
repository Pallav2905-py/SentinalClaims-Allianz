export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentParagraph = [];
    let listItems = [];
    let inList = false;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push({
          type: 'p',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push({
          type: 'ul',
          items: [...listItems]
        });
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Empty line - flush current paragraph or list
      if (!trimmedLine) {
        flushParagraph();
        flushList();
        return;
      }

      // Headings
      if (trimmedLine.startsWith('###')) {
        flushParagraph();
        flushList();
        elements.push({
          type: 'h3',
          content: trimmedLine.replace(/^###\s*/, '')
        });
        return;
      }
      if (trimmedLine.startsWith('##')) {
        flushParagraph();
        flushList();
        elements.push({
          type: 'h2',
          content: trimmedLine.replace(/^##\s*/, '')
        });
        return;
      }
      if (trimmedLine.startsWith('#')) {
        flushParagraph();
        flushList();
        elements.push({
          type: 'h1',
          content: trimmedLine.replace(/^#\s*/, '')
        });
        return;
      }

      // List items
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        flushParagraph();
        inList = true;
        listItems.push(trimmedLine.replace(/^[-*]\s*/, ''));
        return;
      }
      
      // Numbered list
      if (/^\d+\.\s/.test(trimmedLine)) {
        flushParagraph();
        if (!inList || listItems.length === 0) {
          flushList();
        }
        inList = true;
        listItems.push(trimmedLine.replace(/^\d+\.\s*/, ''));
        return;
      }

      // Regular text
      if (inList) {
        flushList();
      }
      
      currentParagraph.push(trimmedLine);
    });

    // Flush remaining content
    flushParagraph();
    flushList();

    return elements;
  };

  const formatInlineText = (text) => {
    if (!text) return text;
    
    // Split by bold markers first
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining) {
      // Find bold text **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const beforeBold = remaining.substring(0, boldMatch.index);
        if (beforeBold) {
          parts.push(<span key={key++}>{beforeBold}</span>);
        }
        parts.push(<strong key={key++} className="font-bold text-gray-900">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        // No more bold text, check for italic
        const italicMatch = remaining.match(/\*(.+?)\*/);
        if (italicMatch) {
          const beforeItalic = remaining.substring(0, italicMatch.index);
          if (beforeItalic) {
            parts.push(<span key={key++}>{beforeItalic}</span>);
          }
          parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
          remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
        } else {
          // No more formatting
          parts.push(<span key={key++}>{remaining}</span>);
          break;
        }
      }
    }

    return parts.length > 0 ? parts : text;
  };

  const elements = parseMarkdown(content);

  return (
    <div className={`markdown-content ${className}`}>
      {elements.map((element, index) => {
        switch (element.type) {
          case 'h1':
            return (
              <h1 key={index} className="text-xl font-bold text-gray-900 mb-3 mt-4">
                {formatInlineText(element.content)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={index} className="text-lg font-bold text-gray-900 mb-2 mt-3">
                {formatInlineText(element.content)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="text-base font-bold text-gray-900 mb-2 mt-2">
                {formatInlineText(element.content)}
              </h3>
            );
          case 'p':
            return (
              <p key={index} className="text-sm text-gray-700 mb-3 leading-relaxed">
                {formatInlineText(element.content)}
              </p>
            );
          case 'ul':
            return (
              <ul key={index} className="list-disc list-inside mb-3 space-y-1">
                {element.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-gray-700 leading-relaxed">
                    {formatInlineText(item)}
                  </li>
                ))}
              </ul>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
