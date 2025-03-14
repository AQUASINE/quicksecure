import { defineStore } from 'pinia'
import {ref} from "vue";
import {
    getIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
    addIncidentUpdate,
    setIncidentStatus,
    getOrganizations,
    createOrganization
} from "./api/api.js";

export const useUserStore = defineStore('user', () => {
    const profile = ref({});
    const accessToken = ref("");
    const idToken = ref("");
    const refreshToken = ref("");

    return {
        profile,
        accessToken,
        idToken,
        refreshToken
    }
}, {
    persist: true
})

export const useUiStore = defineStore('ui', () => {
    const loading = ref(true);

    return {
        loading
    }
});

export const useIncidentsStore = defineStore('incidents', () => {
    const incidents = ref([]);

    const fetchIncidents = async () => {
        incidents.value = await getIncidents();
    }

    const addIncident = async (incident) => {
        await createIncident(incident);
        await fetchIncidents();
    }

    const editIncident = async (incident) => {
        await updateIncident(incident);
        await fetchIncidents();
    }

    const removeIncident = async (incidentId) => {
        await deleteIncident(incidentId);
        await fetchIncidents();
    }

    const addUpdateToIncident = async (incidentId, title, content) => {
        await addIncidentUpdate(incidentId, title, content);
        await fetchIncidents();
    }

    const updateIncidentStatus = async (incidentId, status) => {
        await setIncidentStatus(incidentId, status);
        await fetchIncidents();
    }

    fetchIncidents().then(r => console.log("Incidents fetched: " + incidents.value));

    return {
        incidents,
        fetchIncidents,
        addIncident,
        editIncident,
        removeIncident,
        addUpdateToIncident,
        updateIncidentStatus
    }
}, {
    persist: true
});

export const useOrganizationsStore = defineStore('organizations', () => {
    const organizations = ref([]);
    const selectedOrganization = ref("");

    const fetchOrganizations = async () => {
        organizations.value = await getOrganizations();
    }

    const addOrganization = async (organization) => {
        await createOrganization(organization);
        await fetchOrganizations();
    }

    const selectOrganization = (organization) => {
        selectedOrganization.value = organization;
    }

    fetchOrganizations().then(r => selectOrganization(organizations.value[0]));

    return {
        organizations,
        selectedOrganization,
        fetchOrganizations,
        addOrganization,
        selectOrganization
    }
}, {
    persist: true
});