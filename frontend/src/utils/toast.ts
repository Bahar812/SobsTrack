import Swal from 'sweetalert2';

type ToastType = 'success' | 'error' | 'warning';

export const showToast = (message: string, type: ToastType = 'success') => {
  void Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type,
    title: type === 'success' ? 'Berhasil' : type === 'warning' ? 'Pengingat' : 'Gagal',
    text: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
};
