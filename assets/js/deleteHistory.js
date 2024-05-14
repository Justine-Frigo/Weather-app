// Effacer l'historique de recherche
function deleteHistory() {
  localStorage.setItem("cities", JSON.stringify([]));
}

function handleDeleteSubmit() {
  if (confirm("Are you sure you want to delete your search history?")) {
    deleteHistory();
    alert('History successfully deleted!')
    location.reload();
  }
}

export { deleteHistory, handleDeleteSubmit };
