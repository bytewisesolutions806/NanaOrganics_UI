export default function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return 0;

    let score = 0;

    if (password.length > 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strength = getStrength();

  const colors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  return (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded ${i <= strength ? colors[strength] : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}
