import { supabase } from "../../lib/supabase/client";
import { User } from "../../user/types/User";

export class AuthService {
    /**
     * Guarda el ID del usuario actual en el almacenamiento local
     */
    static setCurrentUser(userId: string): void {
        localStorage.setItem('currentUserId', userId);
    }
  
    /**
     * Obtiene el ID del usuario actual desde el almacenamiento local
     */
    static getCurrentUserId(): string | null {
        return localStorage.getItem('currentUserId');
    }
  
    /**
     * Elimina el ID del usuario actual del almacenamiento local
     */
    static clearCurrentUser(): void {
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('pendingRegistration');
    }
  
    /**
     * Obtiene el perfil completo del usuario actual
     */
    static async getCurrentUserProfile(): Promise<User | null> {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error || !data) return null;
            
            return new User({
                id: Number(data.id),
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                role: data.role,
                avatar: data.avatar,
                status: data.status,
                semesterNumber: data.semester_number,
                academicYear: data.academic_year,
                bio: data.bio,
                phone: data.phone,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
            });
        } catch (error) {
            console.error('Error al obtener el perfil del usuario:', error);
            return null;
        }
    }
  
    /**
     * Actualiza el perfil del usuario
     */
    static async updateProfile(userId: string, profileData: Partial<User>): Promise<{success: boolean, message: string}> {
        try {
            // Convertir del formato de User a formato de DB
            const dbProfileData = {
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                avatar: profileData.avatar,
                semester_number: profileData.semesterNumber,
                academic_year: profileData.academicYear,
                bio: profileData.bio,
                phone: profileData.phone,
                updated_at: new Date().toISOString()
            };
            
            const { error } = await supabase
                .from('profiles')
                .update(dbProfileData)
                .eq('id', userId);
                
            if (error) {
                return {
                    success: false,
                    message: error.message || 'Error al actualizar el perfil'
                };
            }
            
            return {
                success: true,
                message: 'Perfil actualizado correctamente'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Error inesperado al actualizar el perfil'
            };
        }
    }

    /**
     * Comprueba si un correo electrónico ha sido verificado
     */
    static async isEmailVerified(email: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.auth.admin.listUsers();
            
            if (error || !data) return false;
            
            const user = data.users.find(u => u.email === email);
            return !!user && user.email_confirmed_at !== null;
        } catch (error) {
            console.error('Error al verificar estado del correo:', error);
            return false;
        }
    }
}