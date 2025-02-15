import React, { useState } from "react";
import JournalList from "../components/JournalList";

const JournalPage = ({ journals, addJournal, deleteJournal, updateJournal }) => {
  const [jName, setTitle] = useState("");
  const [jDescription, setContent] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("Week 1");
  const [editIndex, setEditIndex] = useState(null);  // To track which journal is being edited
  const [editedJournal, setEditedJournal] = useState({});  // To store the edited journal details

  const handleAddJournal = () => {
    if (jName && jDescription) {
      const newJournal = { jName, jDescription, jWeek: selectedWeek };
      addJournal(newJournal);
      setTitle("");
      setContent("");
    }
  };

  // Handle the edit button click
  const handleEditClick = (index) => {
    const journalToEdit = journals[index];
    setEditIndex(index);
    setEditedJournal(journalToEdit);
    setTitle(journalToEdit.jName);
    setContent(journalToEdit.jDescription);
    setSelectedWeek(journalToEdit.jWeek);
  };

  // Save the edited journal
  const handleSaveEditedJournal = () => {
    if (editIndex !== null) {
      const updatedJournal = {
        jName,
        jDescription,
        jWeek: selectedWeek,
      };
      updateJournal(journals[editIndex].id, updatedJournal);  // Save the updated journal
      // Reset the form after saving
      setTitle("");
      setContent("");
      setSelectedWeek("Week 1");
      setEditIndex(null);
    }
  };

  return (
    <div className="container">
      <h1>Weekly Journals</h1>
      <div>
        <h2>{editIndex === null ? "Add a New Journal" : "Edit Journal"}</h2>
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
        <div>
          <label>Choose Week: </label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option value="Week 1">Week 1</option>
            <option value="Week 2">Week 2</option>
            <option value="Week 3">Week 3</option>
            <option value="Week 4">Week 4</option>
			<option value="Week 5">Week 5</option>
            <option value="Week 6">Week 6</option>
            <option value="Week 7">Week 7</option>
            <option value="Week 8">Week 8</option>
			<option value="Week 9">Week 9</option>
            <option value="Week 10">Week 10</option>
            <option value="Week 11">Week 11</option>
            <option value="Week 12">Week 12</option>
			<option value="Week 13">Week 13</option>
            <option value="Week 14">Week 14</option>
            <option value="Week 15">Week 15</option>
            <option value="Week 16">Week 16</option>
			<option value="Week 17">Week 17</option>
            <option value="Week 18">Week 18</option>
            <option value="Week 19">Week 19</option>
            <option value="Week 20">Week 20</option>
			<option value="Week 21">Week 21</option>
            <option value="Week 22">Week 22</option>
            <option value="Week 23">Week 23</option>
            <option value="Week 24">Week 24</option>
            {/* Add more weeks as necessary */}
          </select>
        </div>
        {editIndex === null ? (
          <button onClick={handleAddJournal}>Add Journal</button>
        ) : (
          <button onClick={handleSaveEditedJournal}>Save Edited Journal</button>
        )}
      </div>

      <h2>Previous Journals</h2>
      <JournalList
        journals={journals}
        deleteJournal={deleteJournal}
        handleEditClick={handleEditClick}  // Pass the edit function to JournalList component
      />
    </div>
  );
};

export default JournalPage;
