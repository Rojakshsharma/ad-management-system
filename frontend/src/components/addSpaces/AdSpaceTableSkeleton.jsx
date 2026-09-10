const AdSpaceTableSkeleton = () => {
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
          {[1, 2, 3, 4, 5].map((item) => (
            <tr key={item}>
              <td>
                <div className="skeleton skeleton-text" />
              </td>

              <td>
                <div className="skeleton skeleton-badge" />
              </td>

              <td>
                <div className="skeleton skeleton-text" />
              </td>

              <td>
                <div className="skeleton skeleton-small" />
              </td>

              <td>
                <div className="skeleton skeleton-price" />
              </td>

              <td>
                <div className="skeleton skeleton-button" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdSpaceTableSkeleton;