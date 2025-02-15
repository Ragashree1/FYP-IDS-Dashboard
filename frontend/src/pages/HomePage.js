import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="container">
      <h1>FYP-25-S1-31 SecuBoard</h1>
      <div className="button-container">
        <Link to="/journals">
          <button>View Journals</button>
        </Link>
        {/* Move View Meeting Minutes below View Journals */}
        <Link to="/meeting-minutes">
          <button>View Meeting Minutes</button>
        </Link>
      </div>

 {/* Team Leader Section */}
      <div className="team-leader-section">
        <h2>Team Leader</h2>
        <ul>
          <li>
            <strong>Ganesan Ragashree</strong> - ganesan007@mymail.sim.edu.sg
          </li>
        </ul>
      </div>
	  
      {/* Add a section for Team Members */}
      <div className="team-section">
        <h2>Team Members</h2>
        <ul>
          <li>
            <strong>Jordell Ng Zuo Yao</strong> - jzyng001@mymail.sim.edu.sg
          </li>
          <li>
            <strong>Terrance Khoo Zheng Wei</strong> - tzwkhoo001@mymail.sim.edu.sg
          </li>
          <li>
            <strong>Farah Nurliyana Binte Roseley</strong> - farahnurliyana07@gmail.com
          </li>
		  <li>
            <strong>Kho Li Ming</strong> - limingrock001@gmail.com
          </li>
          {/* Add more team members as necessary */}
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
