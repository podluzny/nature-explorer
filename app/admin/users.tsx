import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { dbService } from '../../src/services';
import type { UserProfile } from '../../src/types';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';

const ROLES: UserProfile['role'][] = ['student', 'teacher', 'admin'];
const ROLE_LABELS: Record<UserProfile['role'], string> = {
  student: '🎒 Ученик',
  teacher: '📚 Учитель',
  admin: '👑 Администратор',
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);

  const load = useCallback(() => dbService.getAllUsers().then(setUsers), []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (user: UserProfile) => {
    const ok = Platform.OS === 'web'
      ? window.confirm(`Удалить пользователя ${user.displayName}?`)
      : await new Promise<boolean>((res) =>
          Alert.alert('Удалить', `Удалить ${user.displayName}?`, [
            { text: 'Отмена', onPress: () => res(false) },
            { text: 'Удалить', style: 'destructive', onPress: () => res(true) },
          ])
        );
    if (ok) {
      await dbService.deleteUser(user.id);
      load();
    }
  };

  const handleRoleChange = async (userId: string, role: UserProfile['role']) => {
    await dbService.updateUserRole(userId, role);
    setEditUser(null);
    load();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <TouchableOpacity onPress={() => setEditUser(item)}>
                <Text style={[styles.roleBadge, styles[`role_${item.role}`]]}>
                  {ROLE_LABELS[item.role]}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Text style={{ fontSize: 18 }}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Role change modal */}
      {editUser && (
        <Modal visible animationType="slide" transparent onRequestClose={() => setEditUser(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Изменить роль</Text>
              <Text style={styles.modalUser}>{editUser.displayName}</Text>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, editUser.role === role && styles.roleOptionActive]}
                  onPress={() => handleRoleChange(editUser.id, role)}
                >
                  <Text style={[styles.roleOptionText, editUser.role === role && styles.roleOptionTextActive]}>
                    {ROLE_LABELS[role]}
                  </Text>
                  {editUser.role === role && <Text>✓</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditUser(null)}>
                <Text style={styles.cancelBtnText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 12,
    ...SHADOW.sm,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 20 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 12, color: COLORS.textMuted },
  roleBadge: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  role_student: { backgroundColor: '#D1FAE5', color: '#065F46' },
  role_teacher: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
  role_admin: { backgroundColor: '#EDE9FE', color: '#5B21B6' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  modalUser: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8 },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg,
  },
  roleOptionActive: { backgroundColor: COLORS.primary },
  roleOptionText: { fontSize: 15, color: COLORS.text },
  roleOptionTextActive: { color: COLORS.white, fontWeight: '700' },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: { color: COLORS.textMuted },
} as any);
