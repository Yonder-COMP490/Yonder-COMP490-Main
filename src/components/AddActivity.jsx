import { useState } from "react";

function AddActivity({ onAdd }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    onAdd({
      name: name,
      date: date,
      description: description,
    });

    setName("");
    setDate("");
    setDescription("");
  }

  return (
    <form className="add-activity" onSubmit={handleSubmit}>
      <h2>Add Activity</h2>

      <input
        type="text"
        placeholder="Activity name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <button type="submit">Add</button>
    </form>
  );
}

export default AddActivity;