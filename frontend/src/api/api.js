import axios from 'axios';
import {useUserStore} from "../store";

const API_BASE_URL = 'https://rpaibx7ki3.execute-api.us-east-2.amazonaws.com/default';

const getAuthHeader = () => {
    const userStore = useUserStore();
    console.log("userStore: ", userStore.idToken.toString())
    axios.defaults.headers.common['Authorization'] = `Bearer ${userStore.idToken}`;
    const header = `Bearer ${userStore.idToken};`
    console.log("header: ", header)
    return header;
}

const getHeaders = () => {
    const userStore = useUserStore();
    return {
        headers: {
            'Authorization': `Bearer ${userStore.idToken}`,
            "Access-Control-Request-Method": "GET",
            origin: window.location.origin,
            "Access-Control-Request-Headers": "Authorization"
        }
    }

}

export const getIncidents = async () => {
    const response = await axios.get(`${API_BASE_URL}/incident`, getHeaders());
    return response.data;
};

export const createIncident = async (incident) => {
    const response = await axios.post(`${API_BASE_URL}/incident`, incident, getHeaders());
    return response.data;
};

export const updateIncident = async (incident) => {
    const response = await axios.put(`${API_BASE_URL}/incident`, incident, getHeaders());
    return response.data;
};

export const deleteIncident = async (incidentId) => {
    const response = await axios.delete(`${API_BASE_URL}/incident`, {data: {incidentId}}, getHeaders());
    return response.data;
};

export const getOrganizations = async () => {
    const response = await axios.get(`${API_BASE_URL}/organization`, {
        headers: {
            'Authorization': getAuthHeader(),
            "Access-Control-Request-Method": "GET",
            origin: window.location.origin,
            "Access-Control-Request-Headers": "Authorization"
        }
    });
    return response.data;
};

export const createOrganization = async (organization) => {
    const response = await axios.post(`${API_BASE_URL}/organization`, organization, getHeaders());
    return response.data;
};