import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { User, UserRole, UserStatus, PlanType } from '../../user/types/User';
import { Session } from '@supabase/supabase-js';
import { AuthService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          fetchUserProfile(currentSession.user.id);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    const checkCurrentSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        fetchUserProfile(currentSession.user.id);
      }
      setLoading(false);
    };

    checkCurrentSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          plans:user_plans(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error al obtener el perfil:', error);
        return;
      }

      if (data) {
        let hasPlan = false;
        let planType: PlanType | undefined = undefined;
        let planExpirationDate: Date | undefined = undefined;
        
        if (data.role === 'tutor' && data.plans && data.plans.length > 0) {
          const activePlans = data.plans
            .filter((plan: any) => new Date(plan.expiration_date) > new Date())
            .sort((a: any, b: any) => new Date(b.expiration_date).getTime() - new Date(a.expiration_date).getTime());
          
          if (activePlans.length > 0) {
            hasPlan = true;
            planType = activePlans[0].plan_type;
            planExpirationDate = new Date(activePlans[0].expiration_date);
          }
        }
        
        const userProfile = new User({
          id: Number(userId),
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role as UserRole,
          avatar: data.avatar,
          status: data.status as UserStatus,
          semesterNumber: data.semester_number,
          academicYear: data.academic_year || '',
          bio: data.bio || '',
          phone: data.phone,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          planType,
          planExpirationDate,
          tutoringsCreated: data.tutorings_created || 0,
          hasPlan
        });

        setUser(userProfile);

        AuthService.setCurrentUser(userId);
      }
    } catch (error) {
      console.error('Error al procesar los datos del perfil:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{success: boolean, message: string}> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          message: error.message || 'Error al iniciar sesión'
        };
      }

      return {
        success: true,
        message: 'Inicio de sesión exitoso'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error inesperado al iniciar sesión'
      };
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<{success: boolean, message: string}> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}&verified=true`,
          data: {
            email: email,
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });
  
      if (error) {
        return {
          success: false,
          message: error.message || 'Error al registrar usuario'
        };
      }
  
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update([
            {
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: userData.role,
              gender: userData.gender,
              semester_number: userData.semesterNumber,
              academic_year: userData.academicYear,
              bio: userData.bio || '',
              phone: userData.phone || '',
              status: 'active',
              avatar: userData.avatar || '',
              updated_at: new Date().toISOString()
            }
          ])
          .eq('id', data.user.id);
  
        if (profileError) {
          console.error("Error al actualizar perfil:", profileError);
        }
      }
  
      return {
        success: true,
        message: 'Registro exitoso. Por favor verifica tu correo electrónico.'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error inesperado al registrar usuario'
      };
    }
  };

  const signOut = async (): Promise<{success: boolean, message: string}> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          message: error.message || 'Error al cerrar sesión'
        };
      }

      AuthService.clearCurrentUser();
      
      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error inesperado al cerrar sesión'
      };
    }
  };

  const verifyEmail = async (email: string): Promise<{success: boolean, message: string, isVerified: boolean}> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return {
          success: false,
          isVerified: false,
          message: 'No se pudo verificar el estado del correo electrónico'
        };
      }

      const { data: authData } = await supabase.auth.admin.listUsers();
      const user = authData.users.find(u => u.email === email);

      if (!user) {
        return {
          success: false,
          isVerified: false,
          message: 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        isVerified: user.email_confirmed_at !== null,
        message: user.email_confirmed_at !== null ? 
          'Correo electrónico verificado' : 
          'Correo electrónico aún no verificado'
      };
    } catch (error: any) {
      return {
        success: false,
        isVerified: false,
        message: error.message || 'Error al verificar el correo electrónico'
      };
    }
  };

  const resetPassword = async (email: string): Promise<{success: boolean, message: string}> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        return {
          success: false,
          message: error.message || 'Error al solicitar cambio de contraseña'
        };
      }
      
      return {
        success: true,
        message: 'Se ha enviado un correo para restablecer la contraseña'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error inesperado al solicitar cambio de contraseña'
      };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    resetPassword
  };
}