import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts
// Note: You might need to host these fonts or include them in your public folder
// For simplicity, we'll stick to default fonts, but this is how you'd register them.
// Font.register({
//   family: 'Oswald',
//   src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontFamily: 'Helvetica', // Default font
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
    maxHeight: 250,
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Helvetica-Bold',
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 1.6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
    marginRight: 5,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.6,
  },
  formula: {
    fontSize: 12,
    fontFamily: 'Courier',
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  importantText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626', // Red for important concepts
  },
  definitionText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#059669', // Green for definitions
  },
  exampleText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#d97706', // Orange for examples
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

// Helper function to parse inline styles like **bold** and HTML color spans
const renderInlineText = (text, defaultStyle) => {
  if (!text) return <Text style={defaultStyle}></Text>;

  // First, handle HTML span tags with color styles
  let processedText = text;
  const elements = [];
  
  // Split by HTML span tags
  const spanRegex = /<span style="color: #([^;]+); font-weight: bold;">([^<]+)<\/span>/g;
  let lastIndex = 0;
  let match;
  
  while ((match = spanRegex.exec(text)) !== null) {
    // Add text before the span
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText.trim()) {
        elements.push(...parseMarkdownText(beforeText, defaultStyle));
      }
    }
    
    // Add the colored span content with appropriate PDF styling
    const colorCode = match[1];
    const spanContent = match[2];
    let spanStyle = { ...defaultStyle, fontFamily: 'Helvetica-Bold' };
    
    if (colorCode === 'dc2626') {
      spanStyle = { ...spanStyle, color: '#dc2626' }; // Red for important
    } else if (colorCode === '059669') {
      spanStyle = { ...spanStyle, color: '#059669' }; // Green for definitions
    } else if (colorCode === 'd97706') {
      spanStyle = { ...spanStyle, color: '#d97706' }; // Orange for examples
    }
    
    elements.push(<Text key={`span-${match.index}`} style={spanStyle}>{spanContent}</Text>);
    lastIndex = spanRegex.lastIndex;
  }
  
  // Add remaining text after last span
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText.trim()) {
      elements.push(...parseMarkdownText(remainingText, defaultStyle));
    }
  }
  
  // If no spans were found, just parse markdown
  if (elements.length === 0) {
    return parseMarkdownText(text, defaultStyle);
  }
  
  return elements;
};

// Helper function to parse **bold** markdown
const parseMarkdownText = (text, defaultStyle) => {
  // This regex finds **bolded text** and captures the content within.
  const parts = text.split(/(\*{2}[\s\S]*?\*{2})/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.substring(2, part.length - 2);
      // For bold text, we merge the default style with the bold font family.
      return <Text key={index} style={{ ...defaultStyle, fontFamily: 'Helvetica-Bold' }}>{boldText}</Text>;
    }
    // For regular text, we just apply the default style.
    return <Text key={index} style={defaultStyle}>{part}</Text>;
  });
};

// Main parser for all content
const renderContent = (content) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const key = `line-${i}`;

    // Skip horizontal lines
    if (line.trim() === '---') {
      elements.push(<View key={key} style={{ borderBottomWidth: 1, borderBottomColor: '#cccccc', marginVertical: 10 }} />);
    } else if (line.trim().startsWith('## ')) {
      const textContent = line.trim().substring(3);
      elements.push(<Text key={key} style={styles.heading}>{renderInlineText(textContent, { fontSize: 18, fontFamily: 'Helvetica' })}</Text>);
    } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      const textContent = line.trim().substring(2, line.trim().length - 2);
      elements.push(<Text key={key} style={styles.title}>{textContent}</Text>);
    } else if (line.trim().startsWith('* ')) {
      const textContent = line.trim().substring(2);
      elements.push(
        <View key={key} style={styles.bulletItem} wrap={false}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{renderInlineText(textContent, { fontSize: 11, lineHeight: 1.6 })}</Text>
        </View>
      );
    } else if (line.trim().startsWith('[FORMULA:')) {
      const textContent = line.trim().substring(9, line.trim().length - 1);
      elements.push(<Text key={key} style={styles.formula}>{textContent}</Text>);
    } else if (line.trim()) { // Any other non-empty line is a paragraph
      elements.push(<Text key={key} style={styles.paragraph}>{renderInlineText(line, { fontSize: 11, lineHeight: 1.6 })}</Text>);
    }
    // Empty lines are ignored, creating space between paragraphs
  }

  return elements;
};

// Create Document Component
const NotePDF = ({ note }) => {
  if (!note || !note.noteContent) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No content available to generate PDF.</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {note.imageUrl && <Image style={styles.image} src={note.imageUrl} />}
        {renderContent(note.noteContent)}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default NotePDF;
