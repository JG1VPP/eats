import {useState} from 'react';
import {Stack, TextField, Typography} from '@mui/material';
import YouTube from 'react-youtube';

function App() {
	const docker = `curl -fsSL https://get.docker.com -o get-docker.sh`;

	const [source, setSource] = useState(`
if false then
	require 'rules/uec' # for UEC contest
else
	RULE = PlainProgram.new('CQJA', 'JA1RL', 'cq@jarl.com', 'jarl.com', 4, 1, DayOfWeek::SUNDAY)
	RULE.add(PlainSection.new('14MHz 電話部門', [Band.new(14000)], [Mode.new('SSB'), Mode.new('FM')]))
	RULE.add(PlainSection.new('21MHz 電話部門', [Band.new(21000)], [Mode.new('SSB'), Mode.new('FM')]))
	RULE.add(PlainSection.new('28MHz 電話部門', [Band.new(28000)], [Mode.new('SSB'), Mode.new('FM')]))
	RULE.add(PlainSection.new('50MHz 電話部門', [Band.new(50000)], [Mode.new('SSB'), Mode.new('FM')]))
end`);

	const target = `
cat << EOS > docker-compose.yaml
version: '3'
services:
  ATS4:
    image: ghcr.io/nextzlog/ats4:master
    ports:
    - 9000:9000
    volumes:
    - ./ats/data:/ats/data
    - ./ats/logs:/ats/logs
    - ./ats.conf:/ats/conf/ats.conf
    - ./rules.rb:/ats/conf/rules.rb
    command: /ats/bin/ats4
  www:
    image: nginx:latest
    ports:
    - 80:80
    volumes:
    - ./proxy.conf:/etc/nginx/conf.d/default.conf
EOS

echo -n 'enter mail hostname: '
read host

echo -n 'enter mail username: '
read user

echo -n 'enter mail password: '
read pass

cat << EOS > ats.conf
play.mailer.host=$host
play.mailer.port=465
play.mailer.ssl=true
play.mailer.user="$user"
play.mailer.password="$pass"
play.mailer.mock=false
ats4.rules=/rules.rb
EOS

cat << EOS > rules.rb
require 'rules/ats'
${source}
RULE
EOS

echo -n 'enter server domain: '
read name

cat << EOS > proxy.conf
server {
  server_name $name;
  location / {
    proxy_pass http://ATS4:9000;
    location ~ /admin {
      allow 127.0.0.1;
      deny all;
    }
  }
}
EOS

docker compose up -d`;

	return (
		<Stack spacing={2}>
			<Typography variant='h2'>
				3-Step ATS-4 Launcher
			</Typography>
			<Typography variant='body1'>
				Install Docker:
			</Typography>
			<TextField
				label='Bash'
				rows={1}
				multiline
				value={docker.trim()}
				InputProps={{readOnly: true}} />
			<Typography variant='body1'>
				Define contest rules:
			</Typography>
			<TextField
				label='Rule'
				rows={8}
				multiline
				value={source.trim()}
				onChange={(e) => setSource(e.target.value)} />
			<Typography variant='body1'>
				Run following command:
			</Typography>
			<TextField
				label='Bash'
				rows={8}
				multiline
				value={target.trim()}
				InputProps={{readOnly: true}} />
			<Typography variant='body1'>
				Access http://localhost
			</Typography>
			<YouTube videoId='Yb6QY7BI4kA' />
		</Stack>
	);
};

export default App;
