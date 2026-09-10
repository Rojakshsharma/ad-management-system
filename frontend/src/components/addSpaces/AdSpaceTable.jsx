import { Pencil } from "lucide-react";

const AdSpaceTable = ({ spaces, onEdit }) => {
  if (!spaces.length) {
    return (
      <div className="empty-state">
        <h3>No ad spaces found</h3>
        <p>Create your first ad space to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Position</th>
            <th>Size</th>
            <th>Year</th>
            <th>Base price</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {spaces.map((space) => (
            <tr key={space.id}>
              <td>
                <strong>Page {space.pageNumber}</strong>
              </td>

              <td>
                <span className="badge">
                  {space.position}
                </span>
              </td>

              <td>{space.size}</td>

              <td>{space.year}</td>

              <td>
                <strong>
                  ₹{Number(space.basePrice).toLocaleString("en-IN")}
                </strong>
                <span className="muted"> / hour</span>
              </td>

              <td>
                <button
                  className="table-action"
                  onClick={() => onEdit(space)}
                >
                  <Pencil size={16} />
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdSpaceTable;