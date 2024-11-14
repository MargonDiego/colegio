/**
 * Hook personalizado para manejar una intervención individual
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import interventionService from '@/services/intervention.service';
import { formatInterventionForDisplay } from '../utils/formatters';
import { validateInterventionData, canModifyIntervention } from '../utils/validations';

export const useIntervention = (interventionId) => {
    const { user } = useAuth();
    const [intervention, setIntervention] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Cargar intervención con todos los detalles relacionados
    const loadIntervention = useCallback(async () => {
        if (!interventionId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await interventionService.getWithDetails(interventionId);
            setIntervention(formatInterventionForDisplay(data));
        } catch (err) {
            console.error('Error loading intervention:', err);
            setError(err.message || 'Error al cargar la intervención');
        } finally {
            setLoading(false);
        }
    }, [interventionId]);

    // Actualizar intervención
    const updateIntervention = useCallback(async (data) => {
        try {
            setSaving(true);
            setError(null);

            // Validar datos
            const validationErrors = validateInterventionData(data, true);
            if (Object.keys(validationErrors).length > 0) {
                throw new Error('Datos de intervención inválidos');
            }

            // Verificar permisos
            if (!canModifyIntervention(intervention, user)) {
                throw new Error('No tiene permisos para modificar esta intervención');
            }

            const updatedIntervention = await interventionService.update(interventionId, {
                ...data,
                informerId: intervention.informerId, // Mantener el informante original
                updatedAt: new Date().toISOString()
            });

            setIntervention(formatInterventionForDisplay(updatedIntervention));
            return updatedIntervention;
        } catch (err) {
            console.error('Error updating intervention:', err);
            setError(err.message || 'Error al actualizar la intervención');
            throw err;
        } finally {
            setSaving(false);
        }
    }, [interventionId, intervention, user]);

    // Agregar/Actualizar acciones tomadas
    const updateActionsTaken = useCallback(async (actions) => {
        try {
            const updatedData = {
                ...intervention,
                actionsTaken: Array.isArray(actions) ? actions : [actions]
            };
            return await updateIntervention(updatedData);
        } catch (err) {
            console.error('Error updating actions:', err);
            throw err;
        }
    }, [intervention, updateIntervention]);

    // Actualizar evaluación de resultados
    const updateOutcomeEvaluation = useCallback(async (evaluation) => {
        try {
            return await updateIntervention({
                ...intervention,
                outcomeEvaluation: evaluation
            });
        } catch (err) {
            console.error('Error updating evaluation:', err);
            throw err;
        }
    }, [intervention, updateIntervention]);

    // Gestionar derivación externa
    const updateExternalReferral = useCallback(async (referralData) => {
        try {
            return await updateIntervention({
                ...intervention,
                requiresExternalReferral: true,
                externalReferralDetails: referralData.details
            });
        } catch (err) {
            console.error('Error updating referral:', err);
            throw err;
        }
    }, [intervention, updateIntervention]);

    // Gestionar comentarios
    const addComment = useCallback(async (commentData) => {
        try {
            setError(null);
            const newComment = await interventionService.addComment({
                ...commentData,
                interventionId,
                userId: user.id
            });

            setIntervention(prev => ({
                ...prev,
                comments: [newComment, ...(prev.comments || [])]
            }));

            return newComment;
        } catch (err) {
            console.error('Error adding comment:', err);
            setError(err.message || 'Error al agregar comentario');
            throw err;
        }
    }, [interventionId, user.id]);

    // Actualizar comentario
    const updateComment = useCallback(async (commentId, content) => {
        try {
            const updatedComment = await interventionService.updateComment(commentId, { content });
            setIntervention(prev => ({
                ...prev,
                comments: prev.comments.map(comment =>
                    comment.id === commentId ? updatedComment : comment
                )
            }));
            return updatedComment;
        } catch (err) {
            console.error('Error updating comment:', err);
            throw err;
        }
    }, []);

    // Eliminar comentario
    const deleteComment = useCallback(async (commentId) => {
        try {
            await interventionService.deleteComment(commentId);
            setIntervention(prev => ({
                ...prev,
                comments: prev.comments.filter(comment => comment.id !== commentId)
            }));
        } catch (err) {
            console.error('Error deleting comment:', err);
            throw err;
        }
    }, []);

    // Cambiar estado
    const changeStatus = useCallback(async (newStatus, resolution = null) => {
        try {
            const updateData = {
                ...intervention,
                status: newStatus
            };

            if (newStatus === 'Resuelto') {
                updateData.dateResolved = new Date().toISOString();
                updateData.outcomeEvaluation = resolution;
            }

            return await updateIntervention(updateData);
        } catch (err) {
            console.error('Error changing status:', err);
            setError(err.message || 'Error al cambiar el estado');
            throw err;
        }
    }, [intervention, updateIntervention]);

    // Programar seguimiento
    const scheduleFollowUp = useCallback(async (date) => {
        try {
            return await updateIntervention({
                ...intervention,
                followUpDate: new Date(date).toISOString()
            });
        } catch (err) {
            console.error('Error scheduling follow-up:', err);
            throw err;
        }
    }, [intervention, updateIntervention]);

    // Agregar feedback de apoderado
    const updateParentFeedback = useCallback(async (feedback) => {
        try {
            return await updateIntervention({
                ...intervention,
                parentFeedback: feedback
            });
        } catch (err) {
            console.error('Error updating parent feedback:', err);
            throw err;
        }
    }, [intervention, updateIntervention]);

    // Estados computados
    const computed = useMemo(() => ({
        isActive: ['Pendiente', 'En Proceso'].includes(intervention?.status),
        requiresFollowUp: intervention?.followUpDate && new Date(intervention.followUpDate) > new Date(),
        daysSinceCreation: intervention?.dateReported
            ? Math.floor((new Date() - new Date(intervention.dateReported)) / (1000 * 60 * 60 * 24))
            : 0,
        hasResolution: !!intervention?.dateResolved,
        hasExternalReferral: intervention?.requiresExternalReferral
    }), [intervention]);

    // Permisos computados
    const permissions = useMemo(() => ({
        canEdit: canModifyIntervention(intervention, user),
        canAddComments: intervention?.status !== 'Cerrado',
        canChangeStatus: ['admin', 'profesor', 'profesional'].includes(user?.role),
        canDeleteComments: user?.role === 'admin',
        isResponsible: intervention?.responsibleId === user?.id,
        isInformer: intervention?.informerId === user?.id
    }), [intervention, user]);

    // Cargar datos iniciales
    useEffect(() => {
        loadIntervention();
    }, [loadIntervention]);

    return {
        intervention,
        loading,
        saving,
        error,
        permissions,
        computed,
        // Métodos principales
        updateIntervention,
        changeStatus,
        refresh: loadIntervention,
        // Gestión de acciones
        updateActionsTaken,
        updateOutcomeEvaluation,
        updateExternalReferral,
        // Gestión de comentarios
        addComment,
        updateComment,
        deleteComment,
        // Seguimiento y feedback
        scheduleFollowUp,
        updateParentFeedback
    };
};