const AdTableSkeleton = () => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ad</th>
            <th>Advertiser</th>
            <th>Target URL</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {[1, 2, 3, 4, 5].map((item) => (
            <tr key={item}>
              <td>
                <div className="skeleton skeleton-text" />
              </td>

              <td>
                <div className="skeleton skeleton-text" />
              </td>

              <td>
                <div className="skeleton skeleton-text" />
              </td>

              <td>
                <div className="skeleton skeleton-badge" />
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

export default AdTableSkeleton;