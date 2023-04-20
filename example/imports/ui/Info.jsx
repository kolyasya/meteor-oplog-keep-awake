import React, { useState, useEffect } from "react";
import { Random } from "meteor/random";
import { useTracker } from "meteor/react-meteor-data";
import { LinksCollection } from "../api/links";

export const Info = () => {
  const [randomParam, setRandomParam] = useState();

  const links = useTracker(() => {
    Meteor.subscribe("links", randomParam);
    return LinksCollection.find().fetch();
  });

  // Trigger resubscription
  useEffect(() => {
    setInterval(() => {
      setRandomParam(Random.id());
    }, 5000);
  }, []);


  return (
    <div>
      <h2>Learn Meteor!</h2>
      <ul>
        {links.map((link) => (
          <li key={link._id}>
            <a href={link.url} target="_blank">
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
