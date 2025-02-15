// src/components/JournalList.js
import React from "react";

const JournalList = ({ journals, deleteJournal, handleEditClick }) => {
  // Group journals by week
  const groupedJournals = journals.reduce((acc, journal) => {
    if (!acc[journal.jWeek]) {
      acc[journal.jWeek] = [];
    }
    acc[journal.jWeek].push(journal);
    return acc;
  }, {});

  console.log("Journals array:", journals);
  return (
    <div>
      {Object.keys(groupedJournals).map((jWeek) => (
        <div key={jWeek}>
          <h3>{jWeek}</h3>
          {groupedJournals[jWeek].map((journal, index) => (
            <div key={index} className="journal-item">
              <h4>{journal.jName}</h4>
              <p>{journal.jDescription}</p>
              <button onClick={() => deleteJournal(journal.id)}>Delete</button>
              <button onClick={() => handleEditClick(index)}>Edit</button>

            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default JournalList;
