// Example usage of the Claim Submission API

/**
 * Submit a new claim with files
 */
export async function submitClaim(description, files, audioFile = null) {
  try {
    const formData = new FormData();
    formData.append('textDescription', description);

    // Add all files
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Add audio if provided
    if (audioFile) {
      formData.append('files', audioFile);
    }

    const response = await fetch('/api/user/submit-claim', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for auth
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit claim');
    }

    return data;
  } catch (error) {
    console.error('Error submitting claim:', error);
    throw error;
  }
}

/**
 * Get user's claims
 */
export async function getUserClaims() {
  try {
    const response = await fetch('/api/user/submit-claim', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch claims');
    }

    return data.claims;
  } catch (error) {
    console.error('Error fetching claims:', error);
    throw error;
  }
}

/**
 * Admin: Get all claims with filters
 */
export async function getAdminClaims(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.skip) params.append('skip', filters.skip.toString());

    const response = await fetch(`/api/admin/claims?${params}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch claims');
    }

    return data;
  } catch (error) {
    console.error('Error fetching admin claims:', error);
    throw error;
  }
}

/**
 * Admin: Get claim details
 */
export async function getClaimDetails(claimId) {
  try {
    const response = await fetch(`/api/admin/claims/${claimId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch claim details');
    }

    return data.claim;
  } catch (error) {
    console.error('Error fetching claim details:', error);
    throw error;
  }
}

/**
 * Admin: Approve claim
 */
export async function approveClaim(claimId, reviewNotes) {
  try {
    const response = await fetch(`/api/admin/claims/${claimId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reviewNotes }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to approve claim');
    }

    return data;
  } catch (error) {
    console.error('Error approving claim:', error);
    throw error;
  }
}

/**
 * Admin: Reject claim
 */
export async function rejectClaim(claimId, reviewNotes) {
  try {
    const response = await fetch(`/api/admin/claims/${claimId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reviewNotes }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reject claim');
    }

    return data;
  } catch (error) {
    console.error('Error rejecting claim:', error);
    throw error;
  }
}

/**
 * Admin: Delete claim
 */
export async function deleteClaim(claimId) {
  try {
    const response = await fetch(`/api/admin/claims/${claimId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete claim');
    }

    return data;
  } catch (error) {
    console.error('Error deleting claim:', error);
    throw error;
  }
}

// Example usage in React component:
/*
import { submitClaim, getUserClaims } from '@/lib/api-client';

function ClaimForm() {
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await submitClaim(description, files);
      alert(`Claim submitted! ID: ${result.claimId}`);
      
      // Optionally poll for status
      checkClaimStatus(result.claimId);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkClaimStatus = async (claimId) => {
    // Poll every 5 seconds to check if processing is complete
    const interval = setInterval(async () => {
      const claims = await getUserClaims();
      const claim = claims.find(c => c.id === claimId);
      
      if (claim && claim.status !== 'processing') {
        clearInterval(interval);
        console.log('Claim processed:', claim);
      }
    }, 5000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your claim..."
        minLength={10}
        required
      />
      
      <input
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp3,.wav,.m4a"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Claim'}
      </button>
    </form>
  );
}
*/
