import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import JournalPage from "./pages/JournalPage";
import MeetingMinutesPage from "./pages/MeetingMinutesPage";
import LogsDashboard from "./pages/LogsDashboard";
import api from "./api"

const App = () => {

    const loadJournals = async () => {
    try {
      const response = await api.get("/journals/");
      setJournals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching journals:", error);
    }
  };

  const loadMeetingMinutes = async () => {
    try {
      const response = await api.get("/meetingminutes/");
      setMeetingMinutes(response.data ?? []);
    } catch (error) {
      console.error("Error fetching meeting minutes:", error);
    }
  };

  const [journals, setJournals] = useState(loadJournals);
  const [meetingMinutes, setMeetingMinutes] = useState(loadMeetingMinutes);


  const addJournal = async (journal) => {
    try {
      const response = await api.post("/journals",journal);
      setJournals((prevJournals) => [...prevJournals, response.data]);
      console.log('Journal added:', response.data);
    } catch (error) {
      console.error("Error adding journal:", error);
    }
  };

  const addMeetingMinute = async (minute) => {
    try {
      const response = await api.post("/meetingminutes",minute);
      setMeetingMinutes(response.data);
      console.log('Meeting minute added:', response.data);
    } catch (error) {
      console.error("Error fetching meeting minutes:", error);
    }
  };

  const deleteJournal = async (id) => {
    try {
      console.log("Journal ID to delete:", id);
      await api.delete(`/journals/${id}`);;
      setJournals((prevJournals) => prevJournals.filter((journal) => journal.id !== id));
    } catch (error) {
      console.error("Error deleting journal:", error);
    }
  };

  const deleteMeetingMinute = async (id) => {
    try {
      console.log("Meeting minute ID to delete:", id);
      await api.delete(`/meetingminutes/${id}`);
      setMeetingMinutes((prevMinutes) => prevMinutes.filter((minute) => minute.id !== id));
    } catch (error) {
      console.error("Error deleting meeting minute:", error);
    }
  };

  // Function to update journal
  const updateJournal = async (id, updatedJournal) => {
    try {
      const response = await api.put(`/journals/${id}`, updatedJournal);
      setJournals((prevJournals) =>
        prevJournals.map((journal) =>
          journal.id === id ? response.data : journal
        )
      );
      console.log("Journal updated:", response.data);
    } catch (error) {
      console.error("Error updating journal:", error);
    }
  };

  // Function to update meeting minute
  const updateMeetingMinute = async (id, updatedMinute) => {
    try {
      const response = await api.put(`/meetingminutes/${id}`, updatedMinute);
      setMeetingMinutes((prevMinutes) =>
        prevMinutes.map((minute) =>
          minute.id === id ? response.data : minute
        )
      );
      console.log("Meeting minute updated:", response.data);
    } catch (error) {
      console.error("Error updating meeting minute:", error);
    }
  };
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/logs" element={<LogsDashboard/>} /> 
          <Route
            path="/journals"
            element={
              <JournalPage
                journals={journals}
                addJournal={addJournal}
                deleteJournal={deleteJournal}
                updateJournal={updateJournal}  // Pass the update function as a prop
              />
            }
          />
          <Route
            path="/meeting-minutes"
            element={
              <MeetingMinutesPage
                meetingMinutes={meetingMinutes}
                addMeetingMinute={addMeetingMinute}
                deleteMeetingMinute={deleteMeetingMinute}
                updateMeetingMinute={updateMeetingMinute}  // Pass the update function as a prop
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
