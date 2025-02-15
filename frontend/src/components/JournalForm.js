// src/components/JournalForm.js
import React, { useState } from "react";

const JournalForm = ({ addJournal }) => {
  const [jName, setTitle] = useState("");
  const [jDescription, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jName || !jDescription) return alert("Please fill in both fields!");
    addJournal({ jName, jDescription });
    setTitle("");
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Journal Title"
        value={jName}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Journal Content"
        value={jDescription}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit">Add Journal</button>
    </form>
  );
};

export default JournalForm;
