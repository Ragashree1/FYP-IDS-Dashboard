import React, { useState } from "react";

const MeetingMinutesPage = ({ meetingMinutes, addMeetingMinute, deleteMeetingMinute, updateMeetingMinute }) => {
  const [editIndex, setEditIndex] = useState(null); // To track which minute is being edited
  const [editedMinute, setEditedMinute] = useState({}); // To store the edited minute details

  const [date, setDate] = useState("");
  const [pplpresent, setPeoplePresent] = useState([]);
  const [agenda, setObjective] = useState("");
  const [discussion, setAgenda] = useState("");
  const [actions, setActions] = useState(""); // New state for Actions
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const peopleOptions = ["Mr Tian", "Ragashree", "Jordell", "Terrance", "Farah", "LiMing"];

  const handlePeopleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setPeoplePresent(selectedOptions);
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return "";
    const start = new Date(`2021-01-01T${startTime}:00`);
    const end = new Date(`2021-01-01T${endTime}:00`);
    const diff = end - start;
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / 1000 / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleAddMeetingMinute = () => {
    if (date && pplpresent.length > 0 && agenda && discussion && actions && startTime && endTime) {
      const newMinute = {
        date,
        pplpresent: [...pplpresent],
        agenda,
        discussion,
        actions, // Include Actions in the new meeting minute
        startTime,
        endTime,
        duration: calculateDuration(),
      };
      addMeetingMinute(newMinute);
      setDate("");
      setPeoplePresent([]);
      setObjective("");
      setAgenda("");
      setActions(""); // Clear the Actions field
      setStartTime("");
      setEndTime("");
    }
  };

  const handleEditClick = (index) => {
    const minuteToEdit = meetingMinutes[index];
    setEditIndex(index);
    setEditedMinute(minuteToEdit);
    setDate(minuteToEdit.date);
    setPeoplePresent(minuteToEdit.pplpresent);
    setObjective(minuteToEdit.agenda);
    setAgenda(minuteToEdit.discussion);
    setActions(minuteToEdit.actions); // Load the Actions field for editing
    setStartTime(minuteToEdit.startTime);
    setEndTime(minuteToEdit.endTime);
  };

  const handleSaveEditedMeetingMinute = () => {
    if (editIndex !== null) {
      const updatedMinute = {
        date,
        pplpresent: [...pplpresent],
        agenda,
        discussion,
        actions, // Save the updated Actions field
        startTime,
        endTime,
        duration: calculateDuration(),
      };
      updateMeetingMinute(meetingMinutes[editIndex].id, updatedMinute);
      setDate("");
      setPeoplePresent([]);
      setObjective("");
      setAgenda("");
      setActions(""); // Clear the Actions field
      setStartTime("");
      setEndTime("");
      setEditIndex(null);
    }
  };

  return (
    <div className="container">
      <h2>Add New Meeting Minute</h2>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* People Present Section */}
      <div className="people-select">
        <label>Select people present:</label>
        {peopleOptions.map((person) => (
          <button
            key={person}
            type="button"
            className={pplpresent.includes(person) ? "selected" : ""}
            onClick={() => {
              if (pplpresent.includes(person)) {
                setPeoplePresent(pplpresent.filter((p) => p !== person));
              } else {
                setPeoplePresent([...pplpresent, person]);
              }
            }}
          >
            {person}
          </button>
        ))}
      </div>

      {/* Agenda*/}
      <input
        type="text"
        placeholder="Agenda"
        value={agenda}
        onChange={(e) => setObjective(e.target.value)}
      />

      {/* Discussion Section */}
      <textarea
        placeholder="Discussion"
        value={discussion}
        onChange={(e) => setAgenda(e.target.value)}
      />

      {/* Actions Section */}
      <textarea
        placeholder="Actions"
        value={actions}
        onChange={(e) => setActions(e.target.value)}
      />

      {/* Start and End Time Section */}
      <div className="time-inputs">
        <label>Select time start:</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Start Time"
        />

        <label>Select time end:</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="End Time"
        />
      </div>

      {/* Add or Save Button */}
      {editIndex === null ? (
        <button onClick={handleAddMeetingMinute}>Add Meeting Minute</button>
      ) : (
        <button onClick={handleSaveEditedMeetingMinute}>Save Edited Minute</button>
      )}

      {/* Previous Meeting Minutes List */}
      <h2>Previous Meeting Minutes</h2>
      <ul className="meeting-minutes-list">
        {Array.isArray(meetingMinutes) && meetingMinutes.map((minute, index) => {
          const formattedDate = new Date(minute.date).toLocaleDateString("en-GB");

          return (
            <li key={minute.id} className="meeting-minute-item">
              <h3>{formattedDate}</h3>
              <p><strong>People Present:</strong> {minute.pplpresent}</p>
              <p><strong>Agenda:</strong> {minute.agenda}</p>
              <p><strong>Discussion:</strong> {minute.discussion}</p>
              <p><strong>Actions:</strong> {minute.actions}</p> {/* Display Actions */}
              <p><strong>Start Time:</strong> {minute.startTime}</p>
              <p><strong>End Time:</strong> {minute.endTime}</p>
              <p><strong>Duration:</strong> {minute.duration}</p>
              <button onClick={() => deleteMeetingMinute(minute.id)}>Delete</button>
              <button onClick={() => handleEditClick(index)}>Edit</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MeetingMinutesPage;
