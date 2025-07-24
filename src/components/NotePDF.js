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

// Helper function to parse and render content
const renderContent = (content) => {
  if (!content) return null;

  const lines = content.split('\n').filter(line => line.trim() !== '');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const key = `line-${i}`;

    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<Text key={key} style={styles.title}>{line.substring(2, line.length - 2)}</Text>);
    } else if (line.startsWith('## ')) {
      elements.push(<Text key={key} style={styles.heading}>{line.substring(3)}</Text>);
    } else if (line.startsWith('* ')) {
      elements.push(
        <View key={key} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{line.substring(2)}</Text>
        </View>
      );
    } else if (line.startsWith('[FORMULA:') && line.endsWith(']')) {
      elements.push(<Text key={key} style={styles.formula}>{line.substring(9, line.length - 1).trim()}</Text>);
    } else {
      elements.push(<Text key={key} style={styles.paragraph}>{line}</Text>);
    }
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
